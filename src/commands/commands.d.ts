import { SlashCommandBuilder, InteractionResponse, CommandInteraction, ChatInputCommandInteraction } from "discord.js";

type CommandExecute = (interaction: ChatInputCommandInteraction) => Promise<InteractionResponse<boolean>>

interface Command {
	data: SlashCommandBuilder,
	execute: CommandExecute
}