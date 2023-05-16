import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { PrismaClient, TournamentUpdate } from '@prisma/client';
import * as rivalManager from "../rivals/rival-manager";
import { Leaderboard, LeaderboardGetRivalRanks } from "../leaderboard/leaderboard";
import schedule from 'node-schedule';
import { clientId, channelTournamentLeaderboardId } from '../configs/rivalbot-config.json'

let prisma: PrismaClient;

let leaderboard: Leaderboard;

export async function start(guild: Guild, prismaClient: PrismaClient) {
	prisma = prismaClient;
	leaderboard = new Leaderboard("Top Champion Waves", getRivalRanks(guild), (waves: number) => `Wave ${waves}`)
	scheduleLeaderboardUpdates(guild);
	await updateLeaderboard(guild);
}

function scheduleLeaderboardUpdates(guild: Guild) {
	const update = async () => {
		await updateLeaderboard(guild);
	}
	schedule.scheduleJob("*/5 * * * *", update);
	console.log("Scheduled tournament leaderboard to update every five minutes.");
}

function getRivalRanks(guild: Guild): LeaderboardGetRivalRanks {
	const func = async () => {
		const positions = await getRivalPositions();
		return positions.map((position, i) => {
			return {
				name: guild.members.cache.get(position.rivalId).user.username,
				value: Number(position.waves),
				position: i,
				timestamp: Number(position.timestamp)
			}
		});
	}

	return func;
}

// Updates the leaderboard embed.
export async function updateLeaderboard(guild: Guild) {
	const channel = guild.channels.cache.get(channelTournamentLeaderboardId) as TextChannel;
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

async function getRivalPositions(): Promise<TournamentUpdate[]> {
	// Rewrite this to be a single Prisma query, if I can figure out how.
	const rivals = await prisma.rival.findMany();
	const positions: TournamentUpdate[] = await Promise.all(rivals.map(async (rival) =>
		rivalManager.getLatestTournamentUpdate(rival.id)
	));

	// Some magic here to filter out falsy values (the `.filter(Boolean)` bit).
	return positions.filter(Boolean).sort((a, b) => Number(b.waves - a.waves));
}

export async function update(id: string, waves: number, timestamp: number, guild: Guild): Promise<boolean> {
    const rival = await rivalManager.createOrGetRival(id, guild);

	await prisma.tournamentUpdate.create({
		data: {
			waves: waves,
			timestamp: timestamp,
            version: "0.18.21",
			rivalId: rival.id
		}
	});

	// Could this not have await and still work, maybe? It'd make updates snappier.
	await updateLeaderboard(guild);
    return true;
}

export async function leaderboardEmbed(): Promise<EmbedBuilder> {
	return await leaderboard.leaderboardEmbed();
}