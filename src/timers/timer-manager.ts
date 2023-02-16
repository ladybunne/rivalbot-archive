import { Guild, GuildChannel, GuildMember, GuildVoiceChannelResolvable, PermissionsBitField, VoiceChannel } from 'discord.js';
import { channelTournamentTimerId, channelEventTimerId, channelMissionsTimerId } from '../configs/rivalbot-config.json';
import schedule from 'node-schedule';
import { handleError } from '../common';


const rolloverTime = new Date().setHours(0, 0, 0, 0);
const tomorrow = new Date(rolloverTime);
const tournamentDays = [2, 5];
const eventStartDay = new Date("2023-02-13");
const eventTotalDays = 14;

let tournamentHours: number = -1;
let eventDay: number = -1;
let missionsHours: number = -1;

export async function start(guild: Guild) {
	const update = async () => {
		// console.log("Running a scheduled timer update.")
		await updateTimers(guild);
	}
	schedule.scheduleJob("*/10 * * * *", update);
	console.log("Scheduled timers to update every ten minutes.");
	await updateTimers(guild);
}

async function updateTimers(guild: Guild) {
	const now = new Date(Date.now());
	await updateTournamentTimer(guild, now);
	await updateEventTimer(guild, now);
	await updateMissionsTimer(guild, now);
}

async function updateTournamentTimer(guild: Guild, now: Date) {
	tomorrow.setFullYear(now.getFullYear());
	tomorrow.setMonth(now.getMonth());
	tomorrow.setDate(now.getDate() + 1);
	const hoursUntilTomorrow = Math.floor((tomorrow.getTime() - now.getTime()) / 1000 / 60 / 60);
	// const minutesUntilTomorrow = Math.floor((tomorrow.getTime() - now.getTime()) / 1000 / 60 - hoursUntilTomorrow * 60);
	if(tournamentHours != hoursUntilTomorrow) {
		const timerText = `🏆 Live, ~${hoursUntilTomorrow}h left`;
		await updateChannel(guild, channelTournamentTimerId, timerText)
			.then(_ => {
				tournamentHours = hoursUntilTomorrow;
				console.log("Updated tournament timer.")
			})
			.catch(handleError);	
	}
}

async function updateEventTimer(guild: Guild, now: Date) {
	const daysSinceEventStart = Math.floor((now.getTime() - eventStartDay.getTime()) / 1000 / 60 / 60 / 24);
	if(eventDay != daysSinceEventStart) {
		const timerText = `⭐ Day ${daysSinceEventStart}/${eventTotalDays}`;
		await updateChannel(guild, channelEventTimerId, timerText)
			.then(_ => {
				eventDay = daysSinceEventStart;
				console.log("Updated event timer.")
			})
			.catch(handleError);
	}
	
}

async function updateMissionsTimer(guild: Guild, now: Date) {
	tomorrow.setFullYear(now.getFullYear());
	tomorrow.setMonth(now.getMonth());
	tomorrow.setDate(now.getDate() + 1);
	const hoursUntilTomorrow = Math.floor((tomorrow.getTime() - now.getTime()) / 1000 / 60 / 60);
	// const minutesUntilTomorrow = Math.floor((tomorrow.getTime() - now.getTime()) / 1000 / 60 - hoursUntilTomorrow * 60);
	if(missionsHours != hoursUntilTomorrow) {
		const timerText = `🏅 ${5}/${13}, next: ~${hoursUntilTomorrow}h`;
		await updateChannel(guild, channelMissionsTimerId, timerText)
			.then(_ => {
				missionsHours = hoursUntilTomorrow;
				console.log("Updated missions timer.");
			})
			.catch(handleError);	
	}
}

async function updateChannel(guild: Guild, channelId: string, name: string, visible: boolean = true) {
	const channel: VoiceChannel = guild.channels.cache.get(channelId) as VoiceChannel;
	await channel.setName(name)
		.then(channel => {})
		.catch(handleError);
	// await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { ViewChannel: visible })
}