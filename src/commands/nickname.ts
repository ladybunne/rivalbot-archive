import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction, DataResolver } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('nickname')
	.setDescription('Set a user\'s nickname.')
	.addUserOption(option =>
		option.setName("user")
			.setDescription("The user to nickname.")
			.setRequired(true))
	.addStringOption(option =>
		option.setName("nickname")
			.setDescription("The new nickname for the user.")
			.setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: false });

	const forbiddenUsernames = ["Ladybunne", "RivalBot"];

	if(forbiddenUsernames.includes(interaction.options.getUser("user").username)) {
		interaction.editReply({ content: `Banned ${interaction.user} for nickname crimes... just kidding.` });
		return;
	}

	const member = await interaction.guild.members.fetch()
		.then((members) => members.find(member => member.id == interaction.options.getUser("user").id));

	const nickname = interaction.options.getString("nickname");
	const oldNickname = member.nickname;

	await member.setNickname(nickname)
		.then((user) => interaction.editReply({
			content: `User ${interaction.user} changed ${user.user.username}'s nickname from \`${oldNickname}\` to \`${nickname}\`.` }))
		.catch((error) => interaction.editReply({
			content: `User ${interaction.user} failed to change ${interaction.options.getUser("user").username}'s nickname from \`${oldNickname}\` to \`${nickname}\` (error: ${error}).` }));
}