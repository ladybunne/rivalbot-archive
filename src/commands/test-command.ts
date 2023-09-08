import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, ModalBuilder, SlashCommandBuilder, StageInstancePrivacyLevel, TextInputBuilder, TextInputStyle } from "discord.js";
import { DateTime } from "luxon";
import * as coinsManager from "../coins/coins-manager";
import * as rivalManager from "../rivals/rival-manager";
import * as timerManager from "../timers/timer-manager";

const modal = new ModalBuilder()
		.setCustomId("blahblahblah")
		.setTitle("Nickname Crimes - En Masse")

modal.addComponents(["Squishalot", "Z0la", "Skye", "West", "silverbullet"].map(name =>
	new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder()
		.setCustomId(name)
		.setLabel(name)
		.setStyle(TextInputStyle.Short)
		.setMaxLength(32)
		.setRequired(false)
)))

export const data = new SlashCommandBuilder()
	.setName('test-command')
	.setDescription('Test some unfinished functionality.');
	
export async function execute(interaction: ChatInputCommandInteraction) {
	// await interaction.deferReply({ ephemeral: false });

	const embed = new EmbedBuilder()
	.setTitle("Fucking Discord")
	.setColor("#FF00FF")
	.setDescription("Here's some garbage! :)" +
		"\n#1000. asdf" +
		"\n#2. asdf" + 
		"\n#3. asdf" +
		"\n#42. wow" +
		"\n#1234. long text")
	.setFooter({text: "fucking unbelievable"})

	await interaction.showModal(modal)
	// await interaction.followUp({ embeds: [embed] });
}