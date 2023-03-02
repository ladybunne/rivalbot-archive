import { CoinsUpdate, PrismaClient, Rival } from "@prisma/client";
import { Guild } from "discord.js";
import { updateLeaderboard } from "../coins/coins-manager";

let prisma: PrismaClient;

export async function start(guild: Guild, prismaClient: PrismaClient) {
	prisma = prismaClient;
}

// Get a Rival by ID, or if they don't exist yet, create and return them.
export async function createOrGetRival(id: string): Promise<Rival> {
	const existingRival = await prisma.rival.findFirst({
		where: {
			id: id
		}
	});

	if(existingRival) return existingRival;

	return await prisma.rival.create({
		data: {
			id: id
		}
	});
}

export async function getLatestCoinsUpdate(id: string): Promise<CoinsUpdate> {
	return await prisma.coinsUpdate.findFirst({
		where: {
			rivalId: id
		},
		orderBy: [
			{
				timestamp: "desc"
			}
		]
	})
}