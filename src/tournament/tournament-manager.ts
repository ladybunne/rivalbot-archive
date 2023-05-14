import { Guild } from "discord.js";
import { PrismaClient } from '@prisma/client';
import * as rivalManager from "../rivals/rival-manager";

let prisma: PrismaClient;

export function start(guild: Guild, prismaClient: PrismaClient) {
	prisma = prismaClient;
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

    return true;
}