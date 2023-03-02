import { EmbedBuilder } from '@discordjs/builders';
import { CoinsUpdate, PrismaClient } from '@prisma/client';
import { Client, Guild, TextChannel } from 'discord.js';
import fs from 'fs/promises';
import schedule from 'node-schedule';
import { channelCoinsLeaderboard } from '../configs/rivalbot-config.json'
import * as rivalManager from "../rivals/rival-manager";

let prisma: PrismaClient;

const COIN_PARSE_ERROR_NUMBER_INVALID = -1;

export async function start(guild: Guild, prismaClient: PrismaClient) {
	prisma = prismaClient;
	scheduleLeaderboardUpdates(guild);
	await updateLeaderboard(guild);
}

function scheduleLeaderboardUpdates(guild: Guild) {
	const update = async () => {
		await updateLeaderboard(guild);
	}
	schedule.scheduleJob("*/5 * * * *", update);
	console.log("Scheduled coins leaderboard to update every five minutes.");
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

	await updateLeaderboard(guild);
	return true;
}

const parseCoins = /([0-9]+)\.?([0-9]{0,2})([KkMmBbTtQq]?)/

function getActualCoins(coins: string): number {
	const matches = parseCoins.exec(coins);
	if(!matches) return COIN_PARSE_ERROR_NUMBER_INVALID;
	const [ _, wholePart, decimalPart, unit ] = matches;
	const wholePartParsed = parseInt(wholePart);
	const decimalPartParsed = parseFloat(`0.${decimalPart}`);
	const multiplier = getUnitMultiplier(unit);
	const output = wholePartParsed * multiplier + decimalPartParsed * multiplier;
	return output;
}

function getUnitMultiplier(unit: string): number {
	switch(unit.toLowerCase()) {
		case "k": 
			return 1_000;
		case "m":
			return 1_000_000;
		case "b":
			return 1_000_000_000;
		case "t":
			return 1_000_000_000_000;
		case "q":
			return 1_000_000_000_000_000;
		default:
			return 1;
	}
}

function getDisplayCoins(coins: number): string {
	let displayValue = coins;
	while(displayValue / 1_000 >= 1) displayValue /= 1000;
	return `${displayValue.toFixed(2)}${getUnit(coins)}`;
}

function getUnit(coins: number): string {
	if(coins >= 1_000_000_000_000_000) return "Q";
	if(coins >= 1_000_000_000_000) return "T";
	if(coins >= 1_000_000_000) return "B";
	if(coins >= 1_000_000) return "M";
	if(coins >= 1_000) return "K";
	return "";
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
		// case 4:
		// 	return "🙃";
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

	const updatesSorted = updates.sort((a, b) => Number(b.coins - a.coins));

	const lines = updatesSorted.map((update, i) => formatCoinsUpdateForLeaderboard(update, i, now, guild));

	const output = lines.reduce((acc, curr, index) => `${acc}${curr}\n`, "");
	
	return output ? output : "No entries.";
}

export async function embed(guild: Guild) {
	const embed = new EmbedBuilder()
	.setColor(15844367)
	.setTitle('Top Lifetime Coins')
	.setDescription(await formattedLeaderboard(guild))
	.setTimestamp()
	.setFooter({ text: 'This is a work in progress. Please expect bugs.' });

	return embed;
}

// Updates the leaderboard embed.
export async function updateLeaderboard(guild: Guild) {
	const channel = guild.channels.cache.get(channelCoinsLeaderboard) as TextChannel;
	let embedMessageFetch = await channel.messages.fetch()
		.then((messages) => messages.first());

	if(!embedMessageFetch) {
		channel.send({ embeds: [await embed(guild)] });
	}
	else {
		embedMessageFetch.edit({ embeds: [await embed(guild)] });
	}
}