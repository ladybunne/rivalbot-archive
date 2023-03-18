import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
// import Tesseract from 'tesseract.js';

export const data = new SlashCommandBuilder()
	.setName('parse-ocr')
	.setDescription('Parse a screenshot using OCR.')
	.addAttachmentOption(option =>
		option.setName("screenshot")
			.setDescription("A screenshot to parse.")
			.setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
	/*
	await interaction.deferReply({ ephemeral: false });
	const attachment = interaction.options.getAttachment("screenshot");
	if(!attachment.contentType.includes("image")) {
		await interaction.editReply({ content: `This \`${attachment.contentType}\` isn't an image, so I can't parse it.` });
		return;
	}

	const worker = await Tesseract.createWorker();
	await worker.loadLanguage('eng');
	await worker.initialize('eng');
	// await worker.setParameters({ tessedit_ocr_engine_mode: Tesseract.OEM.TESSERACT_LSTM_COMBINED })
	const { data: { text } } = await worker.recognize(attachment.attachment.toString());
	await worker.terminate();

	const embed = new EmbedBuilder()
	// .setColor(15844367)
	.setTitle('Text Produced Via OCR')
	.setDescription(`${text}`)
	.setTimestamp()
	.setFooter({ text: 'This is a work in progress. Please expect bugs.' });

	interaction.editReply({ content: `Thanks for the \`${attachment.contentType}\`, ${interaction.user}! Here is your content:`, embeds: [embed] });	
	*/
	await interaction.reply({ content: "This is disabled for now, sorry!", ephemeral: true });
}