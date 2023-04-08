import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import * as rivalManager from "../rivals/rival-manager";

export const data = new SlashCommandBuilder()
	.setName('rival-data')
	.setDescription('Set your own rival data.')
    .addSubcommand(subcommand => 
        subcommand.setName("player")
            .setDescription("Set data about yourself.")
            .addStringOption(option =>
                option.setName("tagline")
                    .setDescription("Your personal tagline.")));
            // .addStringOption(option => 
            //     option.setName("start-date")
            //         .setDescription("The date you started playing. Enter the EXACT string the game shows you.")));
	

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: false });
    
    const tagline = interaction.options.getString("tagline");
    if(tagline) {
        await rivalManager.updateRivalTagline(interaction.user.id, interaction.guild, tagline);
        await interaction.followUp({ content: `Updated tagline.` });
    }

    if(!interaction.replied) {
        await interaction.followUp({ content: `Please invoke this command with at least one argument. Otherwise it does nothing.` });    
    }
    else {
        await interaction.followUp({ content: `All data processed.` });
    }
}