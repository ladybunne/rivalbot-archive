// Require the necessary discord.js classes
import fs from 'node:fs';
import path from 'node:path';
import { Client, EmbedBuilder, Collection, GatewayIntentBits, TextChannel } from 'discord.js';
import { token, guildId } from './configs/rivalbot-config.json';
import { Command } from './commands/commands';
import * as coinManager from "./lifetime-coins/lifetime-coins-manager";
import * as timerManager from "./timers/timer-manager";

// Create a new client instance
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,] });

// Load commands
const commands = new Collection<string, Command>();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	console.log('Ready!');

	client.user.setActivity("with towers.");

	const guild = await client.guilds.fetch(guildId);
	await guild.members.fetch();

	await timerManager.start(guild);

	await coinManager.loadData();
	
	// const exampleEmbed = new EmbedBuilder()
	// 	.setDescription("🐰");

	// client.channels.fetch(channelBotDevId)
	// 	.then(channel => {
	// 		if(channel instanceof TextChannel) {
	// 			channel.send({ embeds: [exampleEmbed] })
	// 		}
	// })

});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

	// console.log(interaction);
});

// Login to Discord with your client's token
client.login(token);