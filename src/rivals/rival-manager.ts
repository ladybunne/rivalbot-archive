import { PrismaClient, Rival, CoinsUpdate } from "@prisma/client";
import { EmbedBuilder, ForumChannel, Guild, GuildMember } from "discord.js";
import { getDisplayCoins } from "../coins/coins-helpers";
import { channelRivalCardsId } from "../configs/rivalbot-config.json";

let prisma: PrismaClient;

export function start(guild: Guild, prismaClient: PrismaClient) {
	prisma = prismaClient;
}

/** Get a Rival by ID, or if they don't exist yet, create and return them. */
export async function createOrGetRival(id: string, guild: Guild): Promise<Rival | undefined> {
	// If they aren't a member of the guild, return undefined.
	const member = guild.members.cache.get(id);
	if(!member) return undefined;

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

/** 
 * Attempts to remove a rival's data from the database if they are no longer a member of the guild. 
 * 
 * @returns If the removal succeeded.
 */
export async function removeRival(id: string, guild: Guild): Promise<boolean> {
	// If they are a member of the guild, return false.
	const member = guild.members.cache.get(id);
	if(member) return false;

	// Delete Rival Card thread.

	// Delete all coins updates.
	await prisma.coinsUpdate.deleteMany({
		where: {
			rivalId: id
		}
	});

	// Delete all tournament updates.

	// Delete the rival.
	await prisma.rival.delete({
		where: {
			id: id
		}
	});

	return true;
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

export function getLatestTournamentUpdate(id: string) {
	return;
}

export async function updateRivalTagline(id: string, guild: Guild, tagline: string) {
	await prisma.rival.update({ 
		data: {
			tagline: tagline
		},
		where: {
			id: id
		}
	});
}

export async function createOrUpdateRivalCard(id: string, guild: Guild) {
	const member: GuildMember = guild.members.cache.get(id);
	if(!member) return undefined;

	const rival = await createOrGetRival(id, guild);
	if(!rival) return;

	const existingThreadId = rival.rivalCardThreadId;
	const channel = await guild.channels.fetch(channelRivalCardsId) as ForumChannel;

	const embed = await rivalCard(id, guild);

	if(!existingThreadId) {
		const newThreadId = await channel.threads.create({ name: `Rival Card - ${member.user.username}`, message: { embeds: [embed] } });
		await prisma.rival.update({
			data: {
				rivalCardThreadId: newThreadId.id
			},
			where: {
				id: id
			}
		})
	}
	else {
		const thread = await channel.threads.fetch(existingThreadId);
		const message = await thread.fetchStarterMessage();
		await message.edit({ embeds: [embed]})
	}
}

export async function rivalCard(id: string, guild: Guild): Promise<EmbedBuilder | undefined> {
	const member: GuildMember = guild.members.cache.get(id);
	if(!member) return undefined;

	const rival: Rival = await createOrGetRival(id, guild);
	if (!rival) return undefined;

	const embedThumbnail = member.user.avatarURL() ?? member.user.defaultAvatarURL;
	const embedColor = member.roles.highest.color;

	const nameFormatted = `**${member.user.username}**\n`
	const tagline = rival.tagline ?? "Formidable Rival";
	const taglineFormatted = `_"${tagline}"_\n`;
	const taglineBefore = false;
	const embedTitle = taglineBefore ? taglineFormatted + nameFormatted : nameFormatted + taglineFormatted;

	const embedDescription = `**Start Date**: ${"<t:1637391600:D>"}, ${"<t:1637391600:R>"}`;

	const tournamentFieldDescription = `**Champ PB**: ${"1450, <t:1680300000:R>"}\n` +
		`**Strategy**: ${rival.tournamentStrategy}`;

	const lifetimeCoins = getDisplayCoins(Number((await getLatestCoinsUpdate(member.id)).coins));
	const farmingFieldDescription = `**Lifetime Coins**: ${lifetimeCoins}\n` +
		`**Strategy**: ${rival.farmingStrategy}`;

	const workshopFieldDescription = `**Main Stats**: x/y/z\n` +
		`**Ultimate Weapons**: ${"Unspecified"}`;

	const embed = new EmbedBuilder()
		.setThumbnail(embedThumbnail)
		.setColor(embedColor)
		.setTitle(embedTitle)
		.setDescription(embedDescription)
		// .setDescription(await rivalCardDescription(member, rival))
		.addFields(
			{ name: "__**Tournament**__", value: tournamentFieldDescription, inline: true },
			{ name: "__**Farming**__", value: farmingFieldDescription, inline: true },
			{ name: "__**Workshop**__", value: workshopFieldDescription }
		)
		.setFooter({ text: 'This is a work in progress. Please expect bugs.' })
		.setTimestamp();

	return embed;
}

async function rivalCardDescriptionOld(member: GuildMember, rival: Rival): Promise<string> {
	return `**Start Date**: ${"<t:1637391600:D>"}, ${"<t:1637391600:R>"}\n\n` +

		`**Lifetime Coins**: ${getDisplayCoins(Number((await getLatestCoinsUpdate(member.id)).coins))}\n` +
		`**Tournament PB:** ${"Champion 461"}\n` +
		`**Tournament Strategy**: ${"Unspecified"}\n\n` +

		`**Workshop**: ${"2000/2000/2000"}\n` +
		`**Ultimate Weapons**: ${"💀 ⌛ 💥 💰 🌀 / 🚀 🔦 ⚡ 🦠"}\n` +
		`**Farming Strategy**: ${"Unspecified"}`;
}