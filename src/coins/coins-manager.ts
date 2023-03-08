import { CoinsUpdate, PrismaClient } from '@prisma/client';
import { Client, Guild, MessageCreateOptions, TextChannel, EmbedBuilder } from 'discord.js';
import fs from 'fs/promises';
import schedule from 'node-schedule';
import { clientId, channelCoinsLeaderboardId, channelEventsFeedId } from '../configs/rivalbot-config.json'
import * as rivalManager from "../rivals/rival-manager";
import { COIN_PARSE_ERROR_NUMBER_INVALID, getActualCoins, getDisplayCoins } from './coins-helpers';

let prisma: PrismaClient;

let rivalPositions: CoinsUpdate[];

export async function start(guild: Guild, prismaClient: PrismaClient) {
	prisma = prismaClient;
	scheduleLeaderboardUpdates(guild);
	await updateLeaderboard(guild);
	rivalPositions = await getRivalPositions();
}

function scheduleLeaderboardUpdates(guild: Guild) {
	const update = async () => {
		await updateLeaderboard(guild);
	}
	schedule.scheduleJob("*/5 * * * *", update);
	console.log("Scheduled coins leaderboard to update every five minutes.");
}

// Updates the leaderboard embed.
export async function updateLeaderboard(guild: Guild) {
	const channel = guild.channels.cache.get(channelCoinsLeaderboardId) as TextChannel;
	let embedMessageFetch = await channel.messages.fetch()
		.then((messages) => messages.first());

	if(!embedMessageFetch) {
		await channel.send({ embeds: [await leaderboardEmbed(guild)] });
	}
	// This check is to allow the dev version of RivalBot to ignore the production version's coin leaderboard message.
	else if(embedMessageFetch.author.id == clientId){
		await embedMessageFetch.edit({ embeds: [await leaderboardEmbed(guild)] });
	}
}

async function getRivalPositions(): Promise<CoinsUpdate[]> {
	// Rewrite this to be a single Prisma query, if I can figure out how.
	let rivals = await prisma.rival.findMany();
	const positions: CoinsUpdate[] = await Promise.all(rivals.map(async (rival) =>
		rivalManager.getLatestCoinsUpdate(rival.id)
	));

	// This should replace the above. Hopefully.
	const positions2 = prisma.rival.findMany({
		select: {
			coinsUpdates: {
				orderBy: [
					{
						timestamp: "desc"
					}
				],
				take: 1
			}
		},
	});
	return positions.sort((a, b) => Number(b.coins - a.coins));
}

export async function update(id: string, coins: string, timestamp: number, guild: Guild): Promise<boolean> {
	// Validate coins amount.
	const actualCoins = getActualCoins(coins);
	if(actualCoins == COIN_PARSE_ERROR_NUMBER_INVALID) {
		return false;
	}

	const rival = await rivalManager.createOrGetRival(id);
	await prisma.coinsUpdate.create({
		data: {
			coins: actualCoins,
			timestamp: timestamp,
			rivalId: rival.id
		}
	});

	await checkLeaderboardPositionChanges(guild, id);
	await updateLeaderboard(guild);
	return true;
}

function getTimeSinceMostRecentEntry(timestamp: number, now: Date): string {
	const difference = Math.floor((now.getTime() - timestamp) / 1000 / 60);
	let display = `${Math.floor(difference) < 1 ? "just now" : `${Math.floor(difference)}m`}`
	if(difference > 60 * 24) {
		display = `${Math.floor(difference / 60 / 24)}d`
	}
	else if(difference > 60) {
		display = `${Math.floor(difference / 60)}h`
	}
	return ` _(${display})_`;
}

function getBadgeByPosition(position: number): string {
	switch(position) {
		case 0:
			return "🥇";
		case 1:
			return "🥈";
		case 2:
			return "🥉";
		default:
			return "";
	}
}

function formatCoinsUpdateForLeaderboard(update: CoinsUpdate, position: number, now: Date, guild: Guild) {
	return `${getBadgeByPosition(position)} ` +
		`${position + 1}. ` +
		`**${guild.members.cache.get(update.rivalId).user.username}**: ${getDisplayCoins(Number(update.coins))} ` +
		`${getTimeSinceMostRecentEntry(Number(update.timestamp), now)}`;
}

async function formattedLeaderboard(guild: Guild): Promise<string> {
	const now = new Date(Date.now());

	const rivals = await prisma.rival.findMany();

	const updates: CoinsUpdate[] = await Promise.all(rivals.map(async (rival) =>
		rivalManager.getLatestCoinsUpdate(rival.id)
	));

	const updatesSorted = [...updates].sort((a, b) => Number(b.coins - a.coins));

	const lines = updatesSorted.map((update, i) => formatCoinsUpdateForLeaderboard(update, i, now, guild));

	const output = lines.reduce((acc, curr) => `${acc}${curr}\n`, "");
	
	return output ? output : "No entries.";
}

export async function leaderboardEmbed(guild: Guild): Promise<EmbedBuilder> {
	const embed = new EmbedBuilder()
	.setColor(15844367)
	.setTitle('Top Lifetime Coins')
	.setDescription(await formattedLeaderboard(guild))
	.setTimestamp()
	.setFooter({ text: 'This is a work in progress. Please expect bugs.' });

	return embed;
}

async function checkLeaderboardPositionChanges(guild: Guild, id: string) {
	let newPositions = await getRivalPositions();
	let overtakees: Map<number, CoinsUpdate> = new Map<number, CoinsUpdate>;

	for(const position of newPositions) {
		const newPosition = newPositions.indexOf(position);
		const oldPosition = rivalPositions.findIndex((update) => update.id == position.id);
		console.log(`${newPosition} <- ${oldPosition}`);
		if(newPosition != -1 && oldPosition != -1 && newPositions.indexOf(position) < rivalPositions.indexOf(position)) {
			overtakees.set(newPositions.indexOf(position), position);
		}
	}

	if(overtakees.size) {
		const overtaker = newPositions.find((position) => position.rivalId == id);
		const notFirstSubmission = Boolean(rivalPositions.find((position) => position.rivalId == id));
		const oldCoins = rivalPositions.find((position) => position.rivalId == id)?.coins ?? 0;
		await sendOvertakeEmbeds(guild, overtaker, newPositions.indexOf(overtaker), Number(oldCoins), overtakees, notFirstSubmission);
	}

	rivalPositions = newPositions;
}

async function overtakeEmbeds(guild: Guild, overtaker: CoinsUpdate, newPosition: number,
	oldCoins: number, overtakees: Map<number, CoinsUpdate>, ping: boolean): Promise<MessageCreateOptions> {

	const overtakeText = `🟢 **${guild.members.cache.get(overtaker.rivalId).user.username}** claims ` +
		`**${formatPosition(newPosition)}** place! (${getDisplayCoins(oldCoins)} -> ${getDisplayCoins(Number(overtaker.coins))} coins)`;

	const lines = [ ...overtakees.entries() ].map(([position, update]) =>
		`🔴 **${guild.members.cache.get(update.rivalId).user.username}** is demoted to ` + 
			`**${formatPosition(position + 1)}** place. (${getDisplayCoins(Number(update.coins))} coins)`
	);

	const demoteText = lines.reduce((acc, curr) => `${acc}${curr}\n`, "");

	let pingsText: string = `<#${channelCoinsLeaderboardId}> <-- <@${overtaker.rivalId}> `;
	if(ping&& false) {
		const overtakeesIds = [ ...overtakees.values() ].map((update) => update.rivalId);
		pingsText += overtakeesIds.reduce((acc, curr) => 
			`${acc}<@${curr}> `, ``);
	}

	const overtakeEmbed = new EmbedBuilder()
		.setDescription(`${overtakeText}`)
		.setColor("Green");

	const demoteEmbed = new EmbedBuilder()
		.setDescription(`${demoteText.length ? demoteText : "this isn't working for some reason"}`)
		.setColor("Red");

	return { content: pingsText, embeds: [overtakeEmbed, demoteEmbed] };
}

// This should probably be in a "leaderboards helper" class or something. It's fine here now.
function formatPosition(position: number): string {
	if(position < 10 || Math.floor(position / 10) % 10 != 1) {
		if(position % 10 == 1) return `${position}st`;
		if(position % 10 == 2) return `${position}nd`;
		if(position % 10 == 3) return `${position}rd`;
	}
	return `${position}th`;
}

async function sendOvertakeEmbeds(guild: Guild, overtaker: CoinsUpdate, newPosition: number,
	oldCoins: number, overtakees: Map<number, CoinsUpdate>, ping: boolean) {
	const channel = guild.channels.cache.get(channelEventsFeedId) as TextChannel;
	const embeds = await overtakeEmbeds(guild, overtaker, newPosition, oldCoins, overtakees, ping);
	channel.send(embeds);
}

// Test function; no longer used.
/*
export async function sendDummyOvertakeEmbeds(guild: Guild) {
	const overtaker: CoinsUpdate = { id: 1, coins: BigInt(120), timestamp: BigInt(1), rivalId: "overtakerId" };

	const overtakees: Map<number, CoinsUpdate> = new Map<number, CoinsUpdate>;
	overtakees.set(121, { id: 2, coins: BigInt(100), timestamp: BigInt(1), rivalId: "overtakeeId" });

	sendOvertakeEmbeds(guild, overtaker, 112, 80, overtakees);
}
*/