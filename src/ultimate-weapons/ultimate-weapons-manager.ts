import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

/**
 * Here we go:
 * 
 * First, we need a source of ultimate weapon data.
 * This will come from Prisma. Obviously.
 * 
 * Second, we need to bundle that data up into dropdowns.
 * 
 * 
 */

/**
 * Discord's API limits have a maximum of 25 dropdown items.
 * This is obviously not compatible with a few notable stats.
 * I'll need to write workaround code to account for this case.
 * 
 * The solution is to have two dropdowns for stats that have more than 25 valid options.
 * Have the first dropdown do the first 25, and the second do the remainder.
 */

export function generateUltimateWeaponDropdowns(ultimateWeapon: string): ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] {

    const stuff = ["Damage", "Quantity", "Cooldown"]

    const stuffMapped = stuff.map(thing => generateSingleDropdown(ultimateWeapon, thing));

    const button = new ButtonBuilder()
        .setCustomId(`ultimate-weapon-button-remove-${ultimateWeapon}`)
        .setLabel("Remove")
        .setStyle(ButtonStyle.Danger)

    const dropdownRows = stuffMapped.map(dropdown => new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(dropdown));
    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    return [...dropdownRows, buttonRow];
}

function generateSingleDropdown(ultimateWeapon: string, statData: string): StringSelectMenuBuilder {
    const stuff = ["one", "two", "three"]

    const stuffMapped = stuff.map(thing => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(thing)
            .setDescription(thing)
            .setValue(thing)
    })

    const blah = new StringSelectMenuBuilder()
        .setCustomId(`ultimate-weapon-dropdown-${ultimateWeapon}-${statData}`)
        .setPlaceholder(statData)
        .addOptions([...stuffMapped]);

    return blah;
}