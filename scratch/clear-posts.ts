import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.blogPost.deleteMany();
  console.log('Deleted all blog posts to allow clean migration without data loss warnings.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
