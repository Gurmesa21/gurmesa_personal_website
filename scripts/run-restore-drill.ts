import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const GPG_PATH = fs.existsSync('C:\\Program Files\\Git\\usr\\bin\\gpg.exe')
  ? 'C:\\Program Files\\Git\\usr\\bin\\gpg.exe'
  : 'gpg';

async function main() {
  const startTime = Date.now();
  console.log('=====================================================');
  console.log('REAL BACKUP & RESTORE DRILL: PG_DUMP -> GPG -> PG_RESTORE');
  console.log('=====================================================\n');

  const sourceDb = 'gurmesa_test_db';
  const targetDb = 'gurmesa_restore_drill_db';
  const containerName = 'gurmesa_website-db-1';
  const passphrase = 'drill-test-passphrase-2026-secure';

  const backupsDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const rawDumpLocal = path.join(backupsDir, 'drill_source.dump');
  const encryptedDumpLocal = path.join(backupsDir, 'drill_encrypted.dump.gpg');
  const decryptedDumpLocal = path.join(backupsDir, 'drill_decrypted.dump');

  // Clean prior drill artifacts
  [rawDumpLocal, encryptedDumpLocal, decryptedDumpLocal].forEach(f => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });

  // 1. Source Database Row Counts
  console.log(`[Step 1] Gathering pre-backup row counts from source database (${sourceDb})...`);
  const sourcePrisma = new PrismaClient({
    datasources: { db: { url: 'postgresql://dev_user:dev_password@127.0.0.1:5433/gurmesa_test_db?schema=public' } }
  });

  const sourceTables: { tablename: string }[] = await sourcePrisma.$queryRawUnsafe(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
  `);

  const sourceRowCounts: Record<string, number> = {};
  for (const t of sourceTables) {
    const res: { count: bigint }[] = await sourcePrisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM "${t.tablename}";
    `);
    sourceRowCounts[t.tablename] = Number(res[0].count);
  }
  await sourcePrisma.$disconnect();

  console.log(`  Source has ${sourceTables.length} tables in public schema.`);

  // 2. Setup Target Database (Fresh empty DB)
  console.log(`\n[Step 2] Preparing fresh target database (${targetDb})...`);
  execSync(`docker exec ${containerName} psql -U dev_user -d postgres -c "DROP DATABASE IF EXISTS ${targetDb};"`);
  execSync(`docker exec ${containerName} psql -U dev_user -d postgres -c "CREATE DATABASE ${targetDb};"`);
  console.log(`  Target database ${targetDb} created successfully.`);

  // 3. pg_dump from source
  console.log(`\n[Step 3] Running pg_dump on ${sourceDb}...`);
  const dumpStart = Date.now();
  execSync(`docker exec ${containerName} pg_dump -U dev_user -d ${sourceDb} -F c -f /tmp/drill_source.dump`);
  execSync(`docker cp ${containerName}:/tmp/drill_source.dump "${rawDumpLocal}"`);
  execSync(`docker exec ${containerName} rm -f /tmp/drill_source.dump`);
  const dumpDurationMs = Date.now() - dumpStart;
  const rawDumpSize = fs.statSync(rawDumpLocal).size;
  console.log(`  pg_dump completed in ${dumpDurationMs}ms (Size: ${rawDumpSize} bytes).`);

  // 4. GPG Symmetric Encryption
  console.log(`\n[Step 4] Encrypting dump file with GPG (AES256)...`);
  const encryptStart = Date.now();
  execSync(`"${GPG_PATH}" --batch --yes --passphrase "${passphrase}" --symmetric --cipher-algo AES256 --output "${encryptedDumpLocal}" "${rawDumpLocal}"`);
  const encryptDurationMs = Date.now() - encryptStart;
  const encryptedSize = fs.statSync(encryptedDumpLocal).size;
  // Delete raw unencrypted dump immediately to verify recovery must decrypt
  fs.unlinkSync(rawDumpLocal);
  console.log(`  GPG encryption completed in ${encryptDurationMs}ms (Encrypted Size: ${encryptedSize} bytes). Raw file deleted.`);

  // 5. GPG Decryption
  console.log(`\n[Step 5] Decrypting dump file with GPG...`);
  const decryptStart = Date.now();
  execSync(`"${GPG_PATH}" --batch --yes --passphrase "${passphrase}" --decrypt --output "${decryptedDumpLocal}" "${encryptedDumpLocal}"`);
  const decryptDurationMs = Date.now() - decryptStart;
  const decryptedSize = fs.statSync(decryptedDumpLocal).size;
  console.log(`  GPG decryption completed in ${decryptDurationMs}ms (Decrypted Size: ${decryptedSize} bytes).`);

  if (decryptedSize !== rawDumpSize) {
    throw new Error(`Size mismatch: raw (${rawDumpSize}) != decrypted (${decryptedSize})`);
  }

  // 6. Copy to container and pg_restore into targetDb
  console.log(`\n[Step 6] Running pg_restore into target database (${targetDb})...`);
  const restoreStart = Date.now();
  execSync(`docker cp "${decryptedDumpLocal}" ${containerName}:/tmp/drill_decrypted.dump`);
  execSync(`docker exec ${containerName} pg_restore -U dev_user -d ${targetDb} --clean --if-exists /tmp/drill_decrypted.dump`);
  execSync(`docker exec ${containerName} rm -f /tmp/drill_decrypted.dump`);
  const restoreDurationMs = Date.now() - restoreStart;
  console.log(`  pg_restore completed in ${restoreDurationMs}ms.`);

  // Clean local decrypted dump
  fs.unlinkSync(decryptedDumpLocal);

  // 7. Verify Target Database Row Counts
  console.log(`\n[Step 7] Verifying target database row counts (${targetDb})...`);
  const targetPrisma = new PrismaClient({
    datasources: { db: { url: `postgresql://dev_user:dev_password@127.0.0.1:5433/${targetDb}?schema=public` } }
  });

  const targetTables: { tablename: string }[] = await targetPrisma.$queryRawUnsafe(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
  `);

  const targetRowCounts: Record<string, number> = {};
  for (const t of targetTables) {
    const res: { count: bigint }[] = await targetPrisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM "${t.tablename}";
    `);
    targetRowCounts[t.tablename] = Number(res[0].count);
  }
  await targetPrisma.$disconnect();

  console.log('\n--- Table Parity Verification ---');
  let mismatches = 0;
  for (const tbl of Object.keys(sourceRowCounts)) {
    const src = sourceRowCounts[tbl];
    const tgt = targetRowCounts[tbl] ?? -1;
    const match = src === tgt ? 'MATCH' : 'MISMATCH';
    if (src !== tgt) mismatches++;
    console.log(`  ${tbl.padEnd(25)}: Source=${String(src).padStart(3)} | Target=${String(tgt).padStart(3)} -> ${match}`);
  }

  const totalTimeMs = Date.now() - startTime;
  console.log(`\nTotal Drill Time (including dump, encrypt, decrypt, restore): ${totalTimeMs}ms (${(totalTimeMs / 1000).toFixed(2)}s)`);

  if (mismatches > 0) {
    throw new Error(`Restore drill failed: ${mismatches} table row count mismatches found!`);
  }

  const report = {
    drillTimestamp: new Date().toISOString(),
    status: 'SUCCESS',
    sourceDatabase: sourceDb,
    targetDatabase: targetDb,
    method: 'pg_dump (custom -F c) -> GPG AES256 Encrypt -> GPG Decrypt -> pg_restore',
    totalDurationMs: totalTimeMs,
    durations: {
      dumpMs: dumpDurationMs,
      encryptMs: encryptDurationMs,
      decryptMs: decryptDurationMs,
      restoreMs: restoreDurationMs
    },
    sizes: {
      rawDumpBytes: rawDumpSize,
      encryptedDumpBytes: encryptedSize,
      decryptedDumpBytes: decryptedSize
    },
    tablesAudited: sourceTables.length,
    tableRowCounts: {
      source: sourceRowCounts,
      target: targetRowCounts
    },
    previousReportAnomalyExplanation: 'In Phase 2 / B1, scripts/restore-drill.ts did not execute pg_dump, gpg encrypt, decrypt, or pg_restore. It merely ran 27 SELECT COUNT(*) queries on the already-existing local database, which took 0.42 seconds. The Phase 3 drill replaces this with a full, end-to-end pg_dump, GPG encryption, GPG decryption, and pg_restore into an isolated target database.'
  };

  const outJson = path.resolve(process.cwd(), 'docs/evidence/phase3/step61-restore-drill-evidence.json');
  fs.writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n[SUCCESS] Restore drill verified with 0 mismatches. Evidence saved to ${outJson}`);
}

main().catch(err => {
  console.error('\n[DRILL ERROR]', err);
  process.exit(1);
});

