import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction, DataResolver } from "discord.js";
import * as coinManager from "../lifetime-coins/lifetime-coins-manager"

const colorHexRegex = /#?([0-9A-Fa-f]{6})/

export const data = new SlashCommandBuilder()
	.setName('set-color')
	.setDescription('Set your role\'s color.')
	.addStringOption(option =>
		option.setName("color")
			.setDescription("A hex-code string of the colour you want (e.g. #2222BB). Colour names like 'blue' will not work.")
			.setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: false });

	const matches = colorHexRegex.exec(interaction.options.getString("color"));
	if(!matches) {
		await interaction.editReply({ content: `Could not parse \`${interaction.options.getString("color")}\` into a valid colour value.`});
		return;
	}

	const member = await interaction.guild.members.fetch()
		.then((members) => members.find(member => member.id == interaction.user.id))

	const role = member.roles.highest;

	try {
		const color = parseInt(matches[1], 16);
		const oldColor = role.color;
		await role.setColor(color);
		await interaction.editReply({ content: `Changed ${role.name}'s color from \`#${oldColor.toString(16)}\` to \`#${matches[1]}\`.` });
	}
	catch(e) {
		await interaction.editReply({ content: `Couldn't change role color (error: ${e}).` });
	}
	
	
}