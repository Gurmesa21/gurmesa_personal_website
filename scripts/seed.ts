import { PrismaClient, AdminUserStatus, ProjectStatus, ProjectConfidentiality, CaseStudyStatus, BlogPostStatus, TestimonialStatus, TestimonialPermissionStatus, InquiryStatus, SocialVisibility, ServiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear previous
  await prisma.auditLog.deleteMany();
  await prisma.caseStudy.deleteMany();
  await prisma.projectMedia.deleteMany();
  await prisma.projectTechnology.deleteMany();
  await prisma.project.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.technology.deleteMany();
  await prisma.service.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.inquiryNote.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.sEOOverride.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.siteSetting.deleteMany();

  // Admin User
  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: '$2b$10$KcZfjTNTRikmmEjG2fBOhepEgNwx7BuOiorC07C9NcEY1fFpCYLme', // password: admin123
      status: AdminUserStatus.ACTIVE,
    }
  });

  // Profile (Singleton)
  await prisma.profile.create({
    data: {
      name: 'John Doe',
      title: 'Full Stack Developer',
      tagline: 'Building robust applications',
      bio: 'Experienced developer with a passion for web technologies.',
      locationLabel: 'New York, USA',
      availabilityStatus: 'Available for freelance',
    }
  });

  // Experience
  await prisma.experience.createMany({
    data: [
      { organization: 'Tech Corp', role: 'Senior Dev', startDate: new Date('2020-01-01'), description: 'Led frontend team', order: 1 },
      { organization: 'Web Studio', role: 'Web Developer', startDate: new Date('2018-01-01'), endDate: new Date('2019-12-31'), description: 'Developed client sites', order: 2 }
    ]
  });

  // Skills
  await prisma.skill.createMany({
    data: [
      { name: 'TypeScript', category: 'Language', order: 1 },
      { name: 'React', category: 'Frontend', order: 2 },
      { name: 'Node.js', category: 'Backend', order: 3 },
      { name: 'PostgreSQL', category: 'Database', order: 4 },
      { name: 'Next.js', category: 'Framework', order: 5 },
    ]
  });

  // SocialLinks
  await prisma.socialLink.createMany({
    data: [
      { platform: 'GitHub', url: 'https://github.com', label: 'GitHub Profile', visibility: SocialVisibility.PUBLIC, order: 1 },
      { platform: 'LinkedIn', url: 'https://linkedin.com', label: 'LinkedIn Profile', visibility: SocialVisibility.PUBLIC, order: 2 },
      { platform: 'Twitter', url: 'https://twitter.com', label: 'Twitter Profile', visibility: SocialVisibility.PUBLIC, order: 3 }
    ]
  });

  // Services
  await prisma.service.createMany({
    data: [
      { slug: 'web-development', title: 'Web Development', summary: 'Custom web apps', description: 'Full stack development', status: ServiceStatus.PUBLISHED, order: 1, startingPriceRange: '$5000+' },
      { slug: 'consulting', title: 'Technical Consulting', summary: 'Architecture advice', description: 'Expert guidance', status: ServiceStatus.PUBLISHED, order: 2 },
      { slug: 'ui-design', title: 'UI/UX Design', summary: 'Beautiful interfaces', description: 'Design systems', status: ServiceStatus.PUBLISHED, order: 3 }
    ]
  });

  // Technologies
  const tReact = await prisma.technology.create({ data: { name: 'React', category: 'Frontend', slug: 'react' } });
  const tNode = await prisma.technology.create({ data: { name: 'Node.js', category: 'Backend', slug: 'nodejs' } });
  const tPrisma = await prisma.technology.create({ data: { name: 'Prisma', category: 'ORM', slug: 'prisma' } });
  const tNext = await prisma.technology.create({ data: { name: 'Next.js', category: 'Framework', slug: 'nextjs' } });

  // Projects
  await prisma.project.create({
    data: {
      title: 'Open Source Dashboard',
      slug: 'os-dashboard',
      status: ProjectStatus.DELIVERED,
      confidentiality: ProjectConfidentiality.PUBLIC,
      summary: 'A public dashboard for analytics.',
      technologies: {
        create: [ { technologyId: tReact.id }, { technologyId: tNext.id } ]
      },
      caseStudy: {
        create: {
          problem: 'Need a dashboard', solution: 'Built one', role: 'Lead Dev', scope: 'Frontend', architectureSummary: 'Next.js app', outcome: 'Success', content: 'Details here', status: CaseStudyStatus.PUBLISHED
        }
      }
    }
  });

  await prisma.project.create({
    data: {
      title: 'Fintech Platform',
      slug: 'fintech-platform',
      status: ProjectStatus.ACTIVE,
      confidentiality: ProjectConfidentiality.ANONYMIZED,
      summary: 'High-scale trading platform for an anonymous client.',
      technologies: {
        create: [ { technologyId: tNode.id }, { technologyId: tPrisma.id } ]
      },
      caseStudy: {
        create: {
          problem: 'Scale issues', solution: 'Microservices', role: 'Backend Dev', scope: 'API', architectureSummary: 'Node + Prisma', outcome: 'Fast', content: 'Details here', status: CaseStudyStatus.PUBLISHED
        }
      }
    }
  });

  await prisma.project.create({
    data: {
      title: 'Secret Internal Tool',
      slug: 'secret-tool',
      status: ProjectStatus.DELIVERED,
      confidentiality: ProjectConfidentiality.PRIVATE,
      summary: 'Confidential project.',
      clientRef: 'CLIENT-X-001',
      internalNotes: 'Very sensitive project for Client X.',
      technologies: {
        create: [ { technologyId: tReact.id } ]
      }
    }
  });

  await prisma.project.create({
    data: {
      title: 'Upcoming Project',
      slug: 'upcoming-project',
      status: ProjectStatus.INQUIRY,
      confidentiality: ProjectConfidentiality.PUBLIC,
      summary: 'Exploring new ideas.',
    }
  });

  // MediaAssets
  const m1 = await prisma.mediaAsset.create({ data: { storageKey: 'img-1.jpg', mimeType: 'image/jpeg', size: 1024 } });
  await prisma.mediaAsset.create({ data: { storageKey: 'img-2.png', mimeType: 'image/png', size: 2048 } });

  // Blog Categories & Tags
  const cat = await prisma.category.create({ data: { name: 'Engineering', slug: 'engineering' } });
  await prisma.tag.create({ data: { name: 'Tutorial', slug: 'tutorial' } });

  // BlogPosts
  await prisma.blogPost.createMany({
    data: [
      { slug: 'first-post', title: 'First Post', excerpt: 'Intro', body: 'Content', status: BlogPostStatus.PUBLISHED, categoryId: cat.id, featuredImageId: m1.id },
      { slug: 'second-post', title: 'Draft Post', excerpt: 'Draft', body: 'Draft Content', status: BlogPostStatus.DRAFT, categoryId: cat.id },
      { slug: 'third-post', title: 'Archived Post', excerpt: 'Archived', body: 'Old content', status: BlogPostStatus.ARCHIVED, categoryId: cat.id }
    ]
  });

  // Testimonials
  await prisma.testimonial.createMany({
    data: [
      { name: 'Alice Smith', content: 'Great work!', permissionStatus: TestimonialPermissionStatus.AUTHORIZED, status: TestimonialStatus.PUBLISHED },
      { name: 'Bob Jones', content: 'Very good.', permissionStatus: TestimonialPermissionStatus.PENDING, status: TestimonialStatus.DRAFT }
    ]
  });

  // Inquiries
  await prisma.inquiry.create({
    data: {
      name: 'Client A', email: 'clienta@test.com', message: 'Hello', status: InquiryStatus.NEW,
      notes: { create: { authorId: admin.id, body: 'Follow up tomorrow.' } }
    }
  });

  await prisma.inquiry.create({
    data: { name: 'Client B', email: 'clientb@test.com', message: 'Quote please', status: InquiryStatus.CONTACTED }
  });

  // SiteSettings
  await prisma.siteSetting.createMany({
    data: [
      { key: 'inquiryRetentionDays', value: 365, type: 'number' },
      { key: 'sendVisitorAcknowledgement', value: false, type: 'boolean' },
      { key: 'publicContactEmail', value: '"contact@example.com"', type: 'string' },
    ]
  });

  console.log('Seed completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
