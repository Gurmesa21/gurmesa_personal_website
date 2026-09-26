import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const projects = await prisma.project.groupBy({ by: ['status', 'confidentiality'], _count: { _all: true } });
  console.log('Projects:', projects);
  const blogs = await prisma.blogPost.groupBy({ by: ['status'], _count: { _all: true } });
  console.log('Blogs:', blogs);
  const services = await prisma.service.count();
  console.log('Services:', services);
  const testimonials = await prisma.testimonial.count();
  console.log('Testimonials:', testimonials);
  const inquiries = await prisma.inquiry.count();
  console.log('Inquiries:', inquiries);
  const skills = await prisma.skill.count();
  console.log('Skills:', skills);
  const socialLinks = await prisma.socialLink.count();
  console.log('SocialLinks:', socialLinks);
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
