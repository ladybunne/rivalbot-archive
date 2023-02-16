import { EmbedBuilder } from '@discordjs/builders';
import { Guild } from 'discord.js';
import fs from 'fs/promises';

// TODO Consider sqlite for data storage.

const lifetimeCoinsFile = "lifetime-coins.json";

type LifetimeCoinsEntry = {
	coins: string,
	timestamp: number
}

const emptyEntry: LifetimeCoinsEntry = { coins: "0", timestamp: 0 }

let data: Map<string, LifetimeCoinsEntry[]> = new Map();

async function saveData() {
	await fs.writeFile(lifetimeCoinsFile, JSON.stringify(Object.fromEntries(data)));
}

export async function loadData() {
	await fs.readFile(lifetimeCoinsFile)
		.then((loadedData) => data = new Map(Object.entries(JSON.parse(loadedData.toString()))))
		.catch((error) => {});
}

export async function update(id: string, coins: string, timestamp: number) {
	if(!data.get(id)) {
		data.set(id, new Array<LifetimeCoinsEntry>);
	}
	const newData: LifetimeCoinsEntry = { coins: coins, timestamp: timestamp };
	data.get(id).push(newData);
	await saveData();
}

const parseCoins = /([0-9]+\.?[0-9]{0,2})([KkMmBbTtQq]?)/

function getActualCoins(entry: LifetimeCoinsEntry): number {
	const matches = parseCoins.exec(entry.coins);
	if(!matches) return 0;
	const [ wholePart, decimalPart, unit ] = matches;
	const wholePartInt = parseInt(wholePart);
	const decimalPartInt = parseInt(decimalPart);
	const multiplier = getUnitMultiplier(unit);
	return wholePartInt * multiplier + decimalPartInt * multiplier * 0.01;
}

function getUnitMultiplier(unit: string): number {
	switch(unit.toLowerCase()) {
		case "k": 
			return 1000;
		case "m":
			return 1000000;
		case "b":
			return 1000000000;
		case "t":
			return 1000000000000;
		case "q":
			return 1000000000000000;
		default:
			return 1;
	}
}

function getMostRecentEntry(entries: LifetimeCoinsEntry[]): LifetimeCoinsEntry {
	return entries.reduce((acc, curr) => acc.timestamp > curr.timestamp ? acc : curr, emptyEntry);
}

function sortMap(user1: [string, LifetimeCoinsEntry[]], user2: [string, LifetimeCoinsEntry[]]) {
	return getActualCoins(getMostRecentEntry(user2[1])) - getActualCoins(getMostRecentEntry(user1[1]));
}

function formattedLeaderboard(guild: Guild): string {
	// Eventually, sort this via parsed coin quantities.
	const output = [...data.entries()]
		.sort(sortMap)
		// Map to text output.
		.map(([user, entries]) => `**${guild.members.cache.get(user).user.username}**: ${entries.slice(-1)[0].coins}`)
		// Condense into one string.
		.reduce((acc, curr, index) => `${acc}${index + 1}. ${curr}\n`, "");
	
	return output ? output : "No entries.";
}

export function embed(guild: Guild) {
	const embed = new EmbedBuilder()
	.setColor(15844367)
	.setTitle('Top Lifetime Coins')
	.setDescription(formattedLeaderboard(guild))
	.setTimestamp()
	.setFooter({ text: 'This is a work in progress. Please expect bugs.' });

	return embed;
}