const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const media = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log(media.map(m => ({ id: m.id, key: m.storageKey, mime: m.mimeType, createdAt: m.createdAt })).slice(0, 10));
}
check().finally(() => prisma.$disconnect());
