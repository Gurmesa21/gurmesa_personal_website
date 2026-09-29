import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  const setting = await prisma.siteSetting.findUnique({ where: { key: 'inquiryRetentionDays' } });
  
  let days = 365;
  if (setting && setting.value) {
    try {
      days = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    } catch {
      days = Number(setting.value) || 365;
    }
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const count = await prisma.inquiry.count({
    where: { createdAt: { lt: cutoffDate } }
  });

  if (isDryRun) {
    console.log(`[DRY RUN] Would delete ${count} inquiries older than ${days} days (before ${cutoffDate.toISOString()}).`);
  } else {
    const deleted = await prisma.inquiry.deleteMany({
      where: { createdAt: { lt: cutoffDate } }
    });
    console.log(`Deleted ${deleted.count} inquiries older than ${days} days.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
