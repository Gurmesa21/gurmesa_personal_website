import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const post = await prisma.blogPost.create({
    data: {
      title: 'XSS Test Post',
      slug: 'xss-test-post',
      excerpt: 'Testing XSS',
      body: 'This is a test. <script>alert("XSS")</script> <img src="x" onerror="alert(1)"> [Link](javascript:alert(1))',
      publishedAt: new Date(),
      status: 'PUBLISHED',
    }
  });
  console.log('Created XSS test post:', post.slug);
}

main().catch(console.error).finally(() => prisma.$disconnect());
