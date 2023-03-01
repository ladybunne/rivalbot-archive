import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.coinsUpdate.deleteMany();
  await prisma.rival.deleteMany();
  const newUser = await prisma.rival.create({
    data: {
      id: "1",
      coinsUpdates: {
        create: {
          amount: 0,
          timestamp: 0
        }
      }
    }
  });
  console.log(newUser);
  const coinsUpdates = await prisma.coinsUpdate.findMany();
  console.log(coinsUpdates);
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