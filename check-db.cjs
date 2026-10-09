const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const profile = await prisma.profile.findFirst();
  console.log('Profile:', profile);
}
check().finally(() => prisma.$disconnect());
