const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    include: {
      media: { include: { media: true } },
      caseStudy: true,
      technologies: { include: { technology: true } }
    }
  });
  console.log('=== PROJECTS ===');
  projects.forEach(p => {
    console.log({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      confidentiality: p.confidentiality,
      mediaCount: p.media.length,
      media: p.media.map(m => ({ order: m.order, storageKey: m.media?.storageKey, mimeType: m.media?.mimeType })),
      technologies: p.technologies.map(t => t.technology.name),
      hasCaseStudy: !!p.caseStudy
    });
  });

  const services = await prisma.service.findMany({
    include: { featuredImage: true }
  });
  console.log('=== SERVICES ===');
  services.forEach(s => {
    console.log({
      id: s.id,
      title: s.title,
      slug: s.slug,
      status: s.status,
      startingPriceRange: s.startingPriceRange,
      deliverablesCount: s.deliverables.length,
      featuredImage: s.featuredImage?.storageKey
    });
  });

  const posts = await prisma.blogPost.findMany({
    include: {
      category: true,
      featuredImage: true,
      _count: { select: { comments: true, likes: true } }
    }
  });
  console.log('=== BLOG POSTS ===');
  posts.forEach(p => {
    console.log({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      category: p.category?.name,
      featuredImage: p.featuredImage?.storageKey,
      commentsCount: p._count.comments,
      likesCount: p._count.likes
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
