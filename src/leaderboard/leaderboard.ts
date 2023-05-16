import { EmbedBuilder } from "discord.js";

/** A structure to represent a rival's position on a leaderboard. */
export type RivalRank = {
    name: string | undefined;
    value: number;
    position: number | undefined;
    timestamp: number;
}

// Types used in Leaderboard.

/** An async function that produces a list of RivalRanks. */
export type LeaderboardGetRivalRanks = () => Promise<RivalRank[]>;

/** A function that transforms a rankable value into a string representation for display. */
export type LeaderboardFormatValue = (value: number) => string;

/**
 * An abstraction of the existing leaderboard systems, designed to read data
 * and output an according embed on a regular cadence.
 */
export class Leaderboard {
    /** The title of the leaderboard embed. */
    title: string;

    /** An async function that produces a list of RivalRanks. */
    getRivalRanks: LeaderboardGetRivalRanks;

    /** A function that transforms a rankable value into a string representation for display. */
    formatValue: LeaderboardFormatValue;

    constructor(title: string, getRivalRanks: LeaderboardGetRivalRanks, formatValue: LeaderboardFormatValue) {
        this.title = title;
        this.getRivalRanks = getRivalRanks;
        this.formatValue = formatValue;
    }

    /** Formats a RivalRank into a human-readable form. */
    private formatRivalRankLine(rivalRank: RivalRank, now: Date): string {
        const userDisplayName = rivalRank.name ?? "Unknown Rival";

        return `${getBadgeByPosition(rivalRank.position)} ` +
            `${rivalRank.position + 1}. ` +
            `**${userDisplayName}**: ${this.formatValue(rivalRank.value)} ` +
            `${getTimeSinceMostRecentEntry(Number(rivalRank.timestamp), now)}`;
    }

    /** Produces the 'description' field of the leaderboard embed. */
    private async formattedLeaderboard(): Promise<string> {
        const now = new Date(Date.now());

        const rivalsRanked = await this.getRivalRanks();

        const lines = rivalsRanked.map((rivalRank) => this.formatRivalRankLine(rivalRank, now));

        const output = lines.reduce((acc, curr) => `${acc}${curr}\n`, "");
        
        return output ? output : "No entries.";
    }

    /** Packages up the embed itself. */
    async leaderboardEmbed(): Promise<EmbedBuilder> {
        const embed = new EmbedBuilder()
        .setColor(15844367)
        .setTitle(this.title)
        .setDescription(await this.formattedLeaderboard())
        .setTimestamp()
        .setFooter({ text: 'This is a work in progress. Please expect bugs.' });
    
        return embed;
    }
}

// This should probably be rewritten to use Luxon.
function getTimeSinceMostRecentEntry(timestamp: number, now: Date): string {
	const difference = Math.floor((now.getTime() - timestamp) / 1000 / 60);
	let display = `${Math.floor(difference) < 1 ? "just now" : `${Math.floor(difference)}m`}`
	if(difference > 60 * 24) {
		display = `${Math.floor(difference / 60 / 24)}d`
	}
	else if(difference > 60) {
		display = `${Math.floor(difference / 60)}h`
	}
	return ` _(${display})_`;
}

/** A little fancy thing to add medals to specific positions. */
function getBadgeByPosition(position: number): string {
    switch(position) {
        case 0:
            return "🥇";
        case 1:
            return "🥈";
        case 2:
            return "🥉";
        default:
            return "";
    }
}