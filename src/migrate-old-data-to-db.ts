import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises';

const prisma = new PrismaClient()

const lifetimeCoinsFile = "lifetime-coins.json";

type LifetimeCoinsEntry = {
	coins: string,
	timestamp: number
}

let data: Map<string, LifetimeCoinsEntry[]> = new Map();

export async function loadData() {
	await fs.readFile(lifetimeCoinsFile)
		.then((loadedData) => data = new Map(Object.entries(JSON.parse(loadedData.toString()))))
		.catch((error) => {});
}

const parseCoins = /([0-9]+)\.?([0-9]{0,2})([KkMmBbTtQq]?)/

function getActualCoins(entry: LifetimeCoinsEntry): number {
	const matches = parseCoins.exec(entry.coins);
	if(!matches) return 0;
	const [ _, wholePart, decimalPart, unit ] = matches;
	const wholePartParsed = parseInt(wholePart);
	const decimalPartParsed = parseFloat(`0.${decimalPart}`);
	const multiplier = getUnitMultiplier(unit);
	const output = wholePartParsed * multiplier + decimalPartParsed * multiplier;
	return output;
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

// This isn't intended to be run, now that the migration is done.
// It is only here for historic reasons.
async function main() {
  throw new Error();

  await loadData();
  // await prisma.coinsUpdate.deleteMany();
  // await prisma.rival.deleteMany();
  await Promise.all([...data.entries()]
		.map(async ([user, entries]) => {
      // Add a rival entry for each rival.
      const createdRival = await prisma.rival.create({
        data: {
          id: user
        }
      });
      // Add a coins update entry for each lifetime coins update.
      await Promise.all(entries.map(async (entry) => {
        await prisma.coinsUpdate.create({
          data: {
            coins: getActualCoins(entry),
            timestamp: entry.timestamp,
            rivalId: createdRival.id
          }
        })
      }));
    }));

  
  // const newUser = await prisma.rival.create({
  //   data: {
  //     id: "1",
  //     coinsUpdates: {
  //       create: {
  //         amount: 0,
  //         timestamp: 0
  //       }
  //     }
  //   }
  // });
  // console.log(newUser);
  // const coinsUpdates = await prisma.coinsUpdate.findMany();
  // console.log(coinsUpdates);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })