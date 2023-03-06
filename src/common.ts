export function handleError(error: Error) {
	console.log(error);
}

export function timeUntil(from: Date, until: Date): string {
	const difference = until.getTime() - from.getTime();
	const days = Math.floor(difference / 1000 / 60 / 60 / 24);
	const hours = Math.floor(difference / 1000 / 60 / 60) % 24;
	return `${days}d ${hours}h`;
}