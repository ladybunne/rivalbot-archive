import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction, TextChannel, ChannelType, Channel } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('send-message')
	.setDescription('Send a message to a channel.')
	.addChannelOption(option =>
		option.setName("channel")
			.setDescription("The channel to send the message to.")
			.setRequired(true))
	.addStringOption(option =>
		option.setName("message")
			.setDescription("The message to send.")
			.setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: true });

	const channel = interaction.options.getChannel("channel");
	if(channel.type === ChannelType.GuildText) {
		const textChannel = channel as TextChannel;
		textChannel.send({ content: interaction.options.getString("message") })
			.then(async (reponse) => await interaction.editReply({ content: 'Acknowledged.' }))
			.catch(async (error) => await interaction.editReply({ content: `Error:\n\n>>>${error}.` }))
	}
	else {
		await interaction.editReply({ content: 'Not a text channel.' })
	}
}