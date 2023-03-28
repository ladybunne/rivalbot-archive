import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction, DataResolver, EmbedBuilder } from "discord.js";
import { commandLifetimeCoinsId, commandSetColorId, channelCoinsLeaderboardId, channelRoleAssignId, channelTowerChatId, channelFutureRivalsId,
	channelResourcesId, channelHelpRoom, userBotAuthorId } from "../configs/rivalbot-config.json"

export const data = new SlashCommandBuilder()
	.setName('welcome-new-rival')
	.setDescription('Welcome a new rival to the server.')
	.addUserOption(option =>
		option.setName("user")
			.setDescription("The user to welcome.")
			.setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: false });

	const user = interaction.options.getUser("user");

	const embedWelcome = new EmbedBuilder()
		.setColor("Blue")
		.setTitle("🙋‍♀️ Welcome!")
		.setDescription(`Welcome, ${user.username}, to **${interaction.guild.name}**! Here is some info for you - please read carefully!`);

	const embedCommands = new EmbedBuilder()
		.setColor("White")
		.setTitle("💻 Commands")
		.setDescription(`RivalBot has many commands available. Try out the following when you have time:\n\n` +
			`<${commandLifetimeCoinsId} to submit your lifetime coin earnings to <#${channelCoinsLeaderboardId}>>\n` +
			`<${commandSetColorId} to change the colour of your name>\n\n` +
			`Type '/' to see a list of commands! Keep an eye out for commands that others use.`);

	const embedChannels = new EmbedBuilder()
		.setColor("Grey")
		.setTitle("#️⃣ Channels")
		.setDescription(`Here are some channels worth looking at:\n\n` +
			`<#${channelRoleAssignId}> to pick some roles\n` +
			`<#${channelTowerChatId}> for general Tower discussion\n` +
			`<#${channelFutureRivalsId}> for future rival proposals\n` +
			`<#${channelResourcesId}> for Tower resources\n\n` +
			`Take a look around the server sometime, there's lots of useful channels.`);

	const embedFinal = new EmbedBuilder()
		.setColor("Green")
		.setTitle("🎆 That's all!")
		.setDescription(`Any questions? Ping <@${userBotAuthorId}> or ask in <#${channelHelpRoom}>. Enjoy the server!`);

	// await interaction.editReply({ embeds: [embed] });
	await interaction.editReply({ content: `<@${user.id}>`, embeds: [embedWelcome, embedCommands, embedChannels, embedFinal] });
}