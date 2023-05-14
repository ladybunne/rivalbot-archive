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
                    .setDescription("Your personal tagline."))
            .addStringOption(option =>
                option.setName("start-date")
                    .setDescription("The day you started playing The Tower. Please enter EXACTLY what is shown in-game.")));
                // option.setName("tagline")
                //     .setDescription("Your personal tagline.")));
            // .addStringOption(option => 
            //     option.setName("start-date")
            //         .setDescription("The date you started playing. Enter the EXACT string the game shows you.")));
	

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: false });
    
    let replied = false;

    const tagline = interaction.options.getString("tagline");
    if(tagline) {
        await rivalManager.updateRivalTagline(interaction.user.id, interaction.guild, tagline);
        await interaction.followUp({ content: `Updated tagline.` });
        replied = true;
    }

    const startDate = interaction.options.getString("start-date");
    if(startDate) {
        const startDateOutcome = await rivalManager.updateRivalStartDate(interaction.user.id, interaction.guild, startDate);
        await interaction.followUp({ content: startDateOutcome ? "Updated start date." : "Could not update start date. Double-check your input and try again." });
        replied = true;
    }

    // Debug this.
    if(!replied) {
        await interaction.followUp({ content: `Please invoke this command with at least one argument. Otherwise it does nothing.` });    
    }
    else {
        const thread = await rivalManager.createOrUpdateRivalCard(interaction.user.id, interaction.guild);
        await interaction.followUp({ content: `All data processed. See the updated rival card here: <#${thread.id}>` });
    }
}