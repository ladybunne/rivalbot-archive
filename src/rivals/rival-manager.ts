import { CoinsUpdate, PrismaClient, Rival } from "@prisma/client";
import { EmbedBuilder, Guild, GuildMember } from "discord.js";
import * as coinsManager from "../coins/coins-manager";
import { getDisplayCoins } from "../coins/coins-helpers";

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

async function rivalCardDescription(member: GuildMember): Promise<string> {
	// return `**Name**: ${member.user.username}\n` +
	return `**Tagline**: _${"Formidable Rival"}_\n` +
		`**Start Date**: ${"<t:1637391600:D>"}, ${"<t:1637391600:R>"}\n\n` +

		`**Lifetime Coins**: ${getDisplayCoins(Number((await getLatestCoinsUpdate(member.id)).coins))}\n` +
		`**Tournament PB:** ${"Champion 461"}\n` +
		`**Tournament Strategy**: ${"WAWSIS"}\n\n` +

		`**Workshop**: ${"2000/2000/2000"}\n` +
		`**Ultimate Weapons**: ${"💀 ⌛ 💥 💰 🌀 / 🚀 🔦 ⚡ 🦠"}\n` +
		`**Farming Strategy**: ${"Devo"}`;
}

export async function rivalCard(guild: Guild, id: string): Promise<EmbedBuilder | undefined> {
	const member: GuildMember = guild.members.cache.get(id);
	if(!member) {
		return undefined;
	}

	const thumbnail = member.user.avatarURL() ?? member.user.defaultAvatarURL;

	const embed = new EmbedBuilder()
	.setThumbnail(thumbnail)
	.setColor(member.roles.highest.color)
	.setTitle(`Rival Card: ${member.user.username}`)
	.setDescription(await rivalCardDescription(member))
	.setTimestamp()
	.setFooter({ text: 'This is a work in progress. Please expect bugs.' });

	return embed;
}