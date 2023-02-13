import { EmbedBuilder } from '@discordjs/builders';
import fs from 'fs/promises';

const lifetimeCoinsFile = "lifetime-coins.json";

type LifetimeCoinsEntry = {
	coins: string,
	timestamp: number
}

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

function formattedLeaderboard(): string {
	// Eventually, sort this via parsed coin quantities.
	const output = [...data.entries()]
		.map(([user, entries]) => `<@${user}>: ${entries.slice(-1)[0].coins}`)
		.reduce((acc, curr, index) => `${acc}${index + 1}. ${curr}\n`, "");
	
	return output ? output : "No entries."
}

export function embed() {
	const embed = new EmbedBuilder()
	.setColor(15844367)
	.setTitle('Top Lifetime Coins')
	.setDescription(formattedLeaderboard())
	.setTimestamp()
	.setFooter({ text: 'This is a work in progress. Please expect bugs.' });

	return embed;
}