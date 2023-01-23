import { Prisma } from '.prisma/requests-client';
import { PrismaClient } from '.prisma/requests-client';
import * as process from 'process';


const prisma = new PrismaClient();

async function fillDb() {
  let requests: Prisma .RequestCreateInput[] = [
    {
      text: 'Новое cообщение',
      costProposal: 3000,
      executorId: '63a898135261f8c9e2ec261d',
      taskId: 1,
    },
    {
      text: 'Новое cообщение',
      costProposal: 3000,
      executorId: '63a898135261f8c9e2ec261d',
      taskId: 2,
    },

  ]
  await Promise.all(
    requests.map(async (request) => {
      await prisma.request.create({
        data: request,
      })
    })
  )
  console.info('🤘️ Database was filled');
}

fillDb()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect()

    process.exit(1);
  })
