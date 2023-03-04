const parseCoins = /([0-9]+)\.?([0-9]{0,2})([KkMmBbTtQq]?)/;
export const COIN_PARSE_ERROR_NUMBER_INVALID = -1;

export function getActualCoins(coins: string): number {
	const matches = parseCoins.exec(coins);
	if(!matches) return COIN_PARSE_ERROR_NUMBER_INVALID;
	const [ _, wholePart, decimalPart, unit ] = matches;
	const wholePartParsed = parseInt(wholePart);
	const decimalPartParsed = parseFloat(`0.${decimalPart}`);
	const multiplier = getUnitMultiplier(unit);
	const output = wholePartParsed * multiplier + decimalPartParsed * multiplier;
	return output;
}

export function getDisplayCoins(coins: number): string {
	let displayValue = coins;
	while(displayValue / 1_000 >= 1) displayValue /= 1000;
	return `${displayValue.toFixed(2)}${getUnit(coins)}`;
}

function getUnitMultiplier(unit: string): number {
	switch(unit.toLowerCase()) {
		case "k": 
			return 1_000;
		case "m":
			return 1_000_000;
		case "b":
			return 1_000_000_000;
		case "t":
			return 1_000_000_000_000;
		case "q":
			return 1_000_000_000_000_000;
		default:
			return 1;
	}
}

function getUnit(coins: number): string {
	if(coins >= 1_000_000_000_000_000) return "Q";
	if(coins >= 1_000_000_000_000) return "T";
	if(coins >= 1_000_000_000) return "B";
	if(coins >= 1_000_000) return "M";
	if(coins >= 1_000) return "K";
	return "";
}