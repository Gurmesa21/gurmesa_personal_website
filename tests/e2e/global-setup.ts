import { execSync } from 'child_process';
import { seed } from '../../scripts/seed';
import { config } from 'dotenv';

export default async function globalSetup() {
  config({ path: '.env.test' });
  const rawEnv = process.env.APP_ENV || 'test';
  const appEnv = rawEnv.replace(/^["']|["']$/g, '').trim();
  const rawDbUrl = process.env.DATABASE_URL || 'postgresql://dev_user:dev_password@127.0.0.1:5433/gurmesa_test_db?schema=public';
  const dbUrl = rawDbUrl.replace(/^["']|["']$/g, '').trim();

  // Strict check: only run when APP_ENV=test and database name ends in _test
  let dbName = '';
  try {
    const url = new URL(dbUrl.replace(/^postgresql:\/\//, 'http://'));
    dbName = url.pathname.replace(/^\//, '');
  } catch (e) {
    throw new Error('Invalid DATABASE_URL in globalSetup: ' + dbUrl);
  }

  const isTestDb = dbName.endsWith('_test') || dbName.endsWith('_test_db');
  if (appEnv !== 'test' || !isTestDb) {
    console.warn(`[globalSetup] Skipping DB reset/seed: APP_ENV='${appEnv}', dbName='${dbName}'. Requires APP_ENV=test and db ending in _test or _test_db.`);
    return;
  }

  console.log(`[globalSetup] Resetting and seeding test database: ${dbName}...`);
  // Ensure all migrations are applied to the test database
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: 'inherit',
  });

  // Seed the test database with all fixtures
  await seed();
  console.log(`[globalSetup] Test database ${dbName} reset and seeded successfully.`);
}
