import { CoinsUpdate, PrismaClient } from '@prisma/client';
import { Client, Guild, MessageCreateOptions, TextChannel, EmbedBuilder } from 'discord.js';
import schedule from 'node-schedule';
import { clientId, channelCoinsLeaderboardId, channelEventsFeedId, userBotAuthorId } from '../configs/rivalbot-config.json'
import * as rivalManager from "../rivals/rival-manager";
import { COIN_PARSE_ERROR_NUMBER_INVALID, getActualCoins, getDisplayCoins } from './coins-helpers';
import { Leaderboard, LeaderboardGetRivalRanks, RivalRank } from '../leaderboard/leaderboard';

let prisma: PrismaClient;

let rivalPositions: CoinsUpdate[];

let leaderboard: Leaderboard;

export async function start(guild: Guild, prismaClient: PrismaClient) {
	prisma = prismaClient;
	leaderboard = new Leaderboard("Top Lifetime Coins", getRivalRanks(guild), getDisplayCoins)
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

function getRivalRanks(guild: Guild): LeaderboardGetRivalRanks {
	const func = async () => {
		const positions = await getRivalPositions();
		return positions.map((position, i) => {
			return {
				name: guild.members.cache.get(position.rivalId).user.username,
				value: Number(position.coins),
				position: i,
				timestamp: Number(position.timestamp),
				isStale: false
			}
		});
	}

	return func;
}

// Updates the leaderboard embed.
export async function updateLeaderboard(guild: Guild) {
	const channel = guild.channels.cache.get(channelCoinsLeaderboardId) as TextChannel;
	const embedMessageFetch = await channel.messages.fetch()
		.then((messages) => messages.first());

	if(!embedMessageFetch) {
		await channel.send({ embeds: [await leaderboardEmbed()] });
	}
	// This check is to allow the dev version of RivalBot to ignore the production version's leaderboard message.
	else if(embedMessageFetch.author.id == clientId){
		await embedMessageFetch.edit({ embeds: [await leaderboardEmbed()] });
	}
}

async function getRivalPositions(): Promise<CoinsUpdate[]> {
	// Rewrite this to be a single Prisma query, if I can figure out how.
	const rivals = await prisma.rival.findMany();
	const positions: CoinsUpdate[] = await Promise.all(rivals.map(async (rival) =>
		rivalManager.getLatestCoinsUpdate(rival.id)
	));

	// This should replace the above. Hopefully.
	// UPDATE: It needs revisiting to ensure it conforms to the right data type.
	// I wish I was more experienced with Prisma.
	const positions2 = await prisma.rival.findMany({
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

	// Some magic here to filter out falsy values (the `.filter(Boolean)` bit).
	return positions.filter(Boolean).sort((a, b) => Number(b.coins - a.coins));
}

export async function update(id: string, coins: string, timestamp: number, guild: Guild): Promise<boolean> {
	// Validate coins amount.
	const actualCoins = Math.floor(getActualCoins(coins));

	// If the coin input doesn't match the expected format, fail.
	if(actualCoins == COIN_PARSE_ERROR_NUMBER_INVALID) {
		return false;
	}

	// If the coin amount is missing a unit, it's almost certainly an input error.
	if(actualCoins < 1000) {
		return false;
	}

	const rival = await rivalManager.createOrGetRival(id, guild);
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

export async function leaderboardEmbed(): Promise<EmbedBuilder> {
	return await leaderboard.leaderboardEmbed();
}

async function checkLeaderboardPositionChanges(guild: Guild, id: string) {
	const newPositions = await getRivalPositions();
	const overtakees: Map<number, CoinsUpdate> = new Map<number, CoinsUpdate>;

	for(const position of newPositions) {
		const oldPosition = rivalPositions.findIndex((update) => update.id == position.id);
		const newPosition = newPositions.indexOf(position);
		// console.log(`${oldPosition} -> ${newPosition}`, newPosition != -1, oldPosition != -1, oldPosition < newPosition);
		if(oldPosition != -1 && newPosition != -1 && oldPosition < newPosition) {
			overtakees.set(newPositions.indexOf(position), position);
		}
	}

	if(overtakees.size) {
		const overtaker = newPositions.find((position) => position.rivalId == id);
		const notFirstSubmission = rivalPositions.some((position) => position.rivalId == id);
		const oldCoins = rivalPositions.find((position) => position.rivalId == id)?.coins ?? 0;
		await sendOvertakeEmbeds(guild, overtaker, newPositions.indexOf(overtaker), Number(oldCoins), overtakees, notFirstSubmission);
	}

	rivalPositions = newPositions;
}

function overtakeEmbeds(guild: Guild, overtaker: CoinsUpdate, newPosition: number,
	oldCoins: number, overtakees: Map<number, CoinsUpdate>, ping: boolean): MessageCreateOptions {

	const overtakeText = `🟢 **${guild.members.cache.get(overtaker.rivalId).user.username}** claims ` +
		`**${formatPosition(newPosition + 1)}** place! (${getDisplayCoins(oldCoins)} -> ${getDisplayCoins(Number(overtaker.coins))} coins)`;

	const lines = [ ...overtakees.entries() ].map(([position, update]) =>
		`🔴 **${guild.members.cache.get(update.rivalId).user.username}** is demoted to ` + 
			`**${formatPosition(position + 1)}** place. (${getDisplayCoins(Number(update.coins))} coins)`
	);

	const demoteText = lines.reduce((acc, curr) => `${acc}${curr}\n`, "");

	let pingsText = `<#${channelCoinsLeaderboardId}> <-- <@${overtaker.rivalId}> `;
	if(ping) {
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
	const embeds = overtakeEmbeds(guild, overtaker, newPosition, oldCoins, overtakees, ping);
	await channel.send(embeds);
}

// Test function; no longer used.

export async function sendDummyOvertakeEmbeds(guild: Guild) {
	const overtaker: CoinsUpdate = { id: 1, coins: BigInt(3000), timestamp: BigInt(1), rivalId: `${userBotAuthorId}`};

	const overtakees: Map<number, CoinsUpdate> = new Map<number, CoinsUpdate>;
	overtakees.set(1, { id: 2, coins: BigInt(2000), timestamp: BigInt(1), rivalId: `${userBotAuthorId}` });

	await sendOvertakeEmbeds(guild, overtaker, 1, 1000, overtakees, false);
}