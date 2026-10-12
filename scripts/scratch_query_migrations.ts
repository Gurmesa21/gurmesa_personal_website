import { PrismaClient } from '@prisma/client';

async function queryDb(url: string, name: string) {
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at;`
    );
    console.log(`=== ${name} ===`);
    console.table(rows);
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(`Error querying ${name}:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const devUrl = 'postgresql://dev_user:dev_password@localhost:5433/gurmesa_db?schema=public';
  const testUrl = 'postgresql://dev_user:dev_password@127.0.0.1:5433/gurmesa_test_db?schema=public';
  await queryDb(devUrl, 'gurmesa_db');
  await queryDb(testUrl, 'gurmesa_test_db');
}

main();
