import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction, DataResolver, EmbedBuilder } from "discord.js";

// Change this to use IDs.
const forbiddenUsernames = ["ladybunne", "rivalbot"];

export const data = new SlashCommandBuilder()
	.setName('nickname')
	.setDescription('Set a user\'s nickname.')
	.addUserOption(option =>
		option.setName("target")
			.setDescription("The user to nickname.")
			.setRequired(true))
	.addStringOption(option =>
		option.setName("nickname")
			.setDescription("The new nickname for the user.")
			.setRequired(true));

// Swap to defer -> edit if this command ever times out. Otherwise stick with this feature.
// Defer -> edit is undesirable since you can't change ephemeral on an editReply.
export async function execute(interaction: ChatInputCommandInteraction) {
	// await interaction.deferReply({ ephemeral: false });

	const targetUser = interaction.options.getUser("target");
	const targetMember = await interaction.guild.members.fetch()
		.then((members) => members.find(member => member.id == targetUser.id));

	const targetOldNickname = targetMember.nickname;
	const targetNewNickname = interaction.options.getString("nickname");

	let outcome: string;
	let outcomeSuccess = true;

	if(forbiddenUsernames.includes(interaction.options.getUser("target").username.toLowerCase()) ||
		forbiddenUsernames.includes(interaction.options.getString("nickname").toLowerCase())) {
		outcome = `Failure. Nickname not changed.\n\n`+
		`**Reason:** Sorry, this user or nickname is forbidden.`;
		outcomeSuccess = false;
	}
	else {
		await targetMember.setNickname(targetNewNickname)
			.then((user) => outcome = `Success! Nickname changed.`)
			.catch((error) => {
				outcome = `Failure. Nickname not changed.\n\n`+
					`**Reason:** ${error}`;
				outcomeSuccess = false;
				console.log(error);
			});
	}

	const description = `**User**: ${interaction.user.username} / ${interaction.user}\n` +
		`**Target**: ${targetUser.username} / ${targetMember}\n` +
		`**Nickname**: ${targetOldNickname} -> ${targetNewNickname}\n\n` +
		`**Outcome**: ${outcome}`;
		
	const embed = new EmbedBuilder()
	.setColor(outcomeSuccess ? "Green" : "Red")
	.setTitle('Nickname Change')
	.setDescription(description)
	.setTimestamp()
	.setFooter({ text: 'This is a work in progress. Please expect bugs.' });

	// await interaction.editReply({ embeds: [embed] });
	await interaction.reply({ embeds: [embed], ephemeral: !outcomeSuccess });
}