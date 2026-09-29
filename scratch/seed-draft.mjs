import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.blogPost.create({
    data: {
      title: 'Leaked Draft Content',
      slug: 'leaked-draft',
      excerpt: 'e',
      body: 'This is highly confidential draft content',
      status: 'DRAFT'
    }
  });
  console.log('Created draft with slug: leaked-draft');
  await prisma.$disconnect();
}
run();
