import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`SELECT status, confidentiality, count(*) FROM "Project" GROUP BY status, confidentiality;`;
  console.log(result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
