import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import * as rivalManager from "../rivals/rival-manager";

const taglineCharLimit = 40;

const tournamentStrategies: string[] = ["Unspecified", "Sandbag", "WAWSIS", "Blender", "Devo", "Hybrid", "Glass Cannon"];
const farmingStrategies: string[] = ["Unspecified", "Blender", "Devo", "Orbdevo", "Maxdevo Only", "Maxdevo into Orbdevo", "Glass Cannon"];

const workshopDamageCap = 6000;
const workshopHealthCap = 5000;
const workshopAbsdefCap = 5000;

export const data = new SlashCommandBuilder()
	.setName('rival-data')
	.setDescription('Set your own rival data.')
    .addSubcommand(subcommand => 
        subcommand.setName("player")
            .setDescription("Set data about yourself.")
            .addStringOption(option =>
                option.setName("tagline")
                    .setDescription(`Your personal tagline (${taglineCharLimit} chars max).`))
            .addStringOption(option =>
                option.setName("start-date")
                    .setDescription("The date you started playing. Please enter EXACTLY what is shown in-game.")))
    .addSubcommand(subcommand => 
        subcommand.setName("tournament")
            .setDescription("Set data about your tournament setup.")
            .addStringOption(option =>
                option.setName("tournament-strategy")
                    .setDescription("Your tournament strategy.")
                    .addChoices( ...tournamentStrategies.map((strat) => {
                        return { name: strat, value: strat }
                    }))))
    .addSubcommand(subcommand => 
        subcommand.setName("farming")
            .setDescription("Set data about your farming setup.")
            .addStringOption(option =>
                option.setName("farming-strategy")
                    .setDescription("Your farming strategy.")
                    .addChoices( ...farmingStrategies.map((strat) => {
                        return { name: strat, value: strat }
                    }))))
    .addSubcommand(subcommand => 
        subcommand.setName("workshop")
            .setDescription("Set data about your workshop and ultimate weapons.")
            .addIntegerOption(option =>
                option.setName("damage")
                    .setDescription("Your Damage stat in your workshop."))
            .addIntegerOption(option =>
                option.setName("health")
                    .setDescription("Your Health stat in your workshop."))
            .addIntegerOption(option =>
                option.setName("absdef")
                    .setDescription("Your Absdef (Defense Absolute) stat in your workshop.")));

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: true });
    
    let replied = false;
    let toUpdate = false;

    const tagline = interaction.options.getString("tagline");
    if(tagline) {
        if(tagline.length <= taglineCharLimit) {
            await rivalManager.updateRivalTagline(interaction.user.id, tagline);
            await interaction.followUp({ content: `Updated tagline.`, ephemeral: true });
            toUpdate = true;
        }
        else {
            await interaction.followUp({ content: `Tagline is too long (maximum of ${taglineCharLimit} characters).`, ephemeral: true });
        }
        replied = true;
    }

    const startDate = interaction.options.getString("start-date");
    if(startDate) {
        const startDateOutcome = await rivalManager.updateRivalStartDate(interaction.user.id, startDate);
        if(startDateOutcome) {
            await interaction.followUp({ content: "Updated start date.", ephemeral: true });
            toUpdate = true;
        }
        else {
            await interaction.followUp({ content: "Could not update start date. Double-check your input and try again.", ephemeral: true });
        }
        replied = true;
    }

    const tournamentStrategy = interaction.options.getString("tournament-strategy");
    if(tournamentStrategy) {
        await rivalManager.updateRivalTournamentStrategy(interaction.user.id, tournamentStrategy);
        await interaction.followUp({ content: `Updated tournament strategy.`, ephemeral: true });
        toUpdate = true;
        replied = true;
    }

    const farmingStrategy = interaction.options.getString("farming-strategy");
    if(farmingStrategy) {
        await rivalManager.updateRivalFarmingStrategy(interaction.user.id, farmingStrategy);
        await interaction.followUp({ content: `Updated farming strategy.`, ephemeral: true });
        toUpdate = true;
        replied = true;
    }

    const damage = interaction.options.getInteger("damage");
    if(damage != undefined) {
        if(damage <= workshopDamageCap) {
            await rivalManager.updateRivalDamage(interaction.user.id, damage);
            await interaction.followUp({ content: `Updated damage.`, ephemeral: true });
            toUpdate = true;
        }
        else {
            await interaction.followUp({ content: `Damage is too high (maximum of ${workshopDamageCap}).`, ephemeral: true });
        }
        replied = true;
    }

    const health = interaction.options.getInteger("health");
    if(health != undefined) {
        if(health <= workshopHealthCap) {
            await rivalManager.updateRivalHealth(interaction.user.id, health);
            await interaction.followUp({ content: `Updated health.`, ephemeral: true });
            toUpdate = true;
        }
        else {
            await interaction.followUp({ content: `Health is too high (maximum of ${workshopHealthCap}).`, ephemeral: true });
        }
        replied = true;
    }

    const absdef = interaction.options.getInteger("absdef");
    if(absdef != undefined) {
        if(absdef <= workshopAbsdefCap) {
            await rivalManager.updateRivalAbsdef(interaction.user.id, absdef);
            await interaction.followUp({ content: `Updated absdef.`, ephemeral: true });
            toUpdate = true;
        }
        else {
            await interaction.followUp({ content: `Absdef is too high (maximum of ${workshopAbsdefCap}).`, ephemeral: true });
        }
        replied = true;
    }

    // Debug this.
    if(!replied) {
        await interaction.followUp({ content: `Please invoke this command with at least one argument. Otherwise it does nothing.`, ephemeral: true });    
    }
    else if(toUpdate) {
        // Use toUpdate here to do conditional updates on the rival cards.
        const thread = await rivalManager.createOrUpdateRivalCard(interaction.user.id, interaction.guild);
        await interaction.followUp({ content: `All data processed. See the updated rival card here: <#${thread.id}>`, ephemeral: true });
    }
}
