import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { DateTime } from "luxon";
import * as coinsManager from "../coins/coins-manager";
import * as rivalManager from "../rivals/rival-manager";
import * as timerManager from "../timers/timer-manager";

export const data = new SlashCommandBuilder()
	.setName('test-command')
	.setDescription('Test some unfinished functionality.');

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: false });

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

	await interaction.followUp({ embeds: [embed] });
}