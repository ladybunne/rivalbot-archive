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

	if(interaction.options.getUser("user").username == "Ladybunne") {
		interaction.editReply({ content: `Banned ${interaction.user} for nickname crimes... just kidding.` });
		return;
	}

	const member = await interaction.guild.members.fetch()
		.then((members) => members.find(member => member.id == interaction.options.getUser("user").id));

	const nickname = interaction.options.getString("nickname")

	await member.setNickname(nickname)
		.then((user) => interaction.editReply({
			content: `User ${interaction.user} set ${user.user.username}'s nickname to \`${nickname}\`.` }))
		.catch((error) => interaction.editReply({
			content: `User ${interaction.user} failed to set ${interaction.options.getUser("user").username}'s nickname to \`${nickname}\` (error: ${error}).` }));
}