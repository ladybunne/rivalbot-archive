import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction } from "discord.js";
import Tesseract from 'tesseract.js';

export const data = new SlashCommandBuilder()
	.setName('test-command')
	.setDescription('Test some unfinished functionality.')
	.addAttachmentOption(option =>
		option.setName("screenshot")
			.setDescription("A screenshot to parse.")
			.setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: false });
	const attachment = interaction.options.getAttachment("screenshot");
	if(!attachment.contentType.includes("image")) {
		await interaction.editReply({ content: `This \`${attachment.contentType}\` isn't an image, so I can't parse it.` });
		return;
	}

	Tesseract.recognize(attachment.attachment.toString(),)
		.then(({data: { text }}) => {
			interaction.editReply({ content: `Thanks for the \`${attachment.contentType}\`, ${interaction.user}! Here is your content:\n\n${text}` });
			return;
		})

	console.log("testing");

	// await interaction.editReply({ content: `Thanks for the \`${attachment.contentType}\`, ${interaction.user}!` });
	
}