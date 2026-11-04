if (process.env.APP_ENV === 'production') {
  console.error('Cannot run seed.ts in production. Use seed-prod.ts instead.');
  process.exit(1);
}

export async function seed() {
  const {
    PrismaClient,
    AdminUserStatus,
    ProjectStatus,
    ProjectConfidentiality,
    CaseStudyStatus,
    BlogPostStatus,
    TestimonialStatus,
    TestimonialPermissionStatus,
    InquiryStatus,
    SocialVisibility,
    ServiceStatus,
  } = await import('@prisma/client');

  const prisma = new PrismaClient();

  try {
    // Clear previous
    await prisma.auditLog.deleteMany();
    await prisma.caseStudy.deleteMany();
    await prisma.projectMedia.deleteMany();
    await prisma.projectTechnology.deleteMany();
    await prisma.project.deleteMany();
    await prisma.postTag.deleteMany();
    if ((prisma as any).blogComment) await (prisma as any).blogComment.deleteMany();
    if ((prisma as any).blogLike) await (prisma as any).blogLike.deleteMany();
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
        passwordHash: '$2b$10$IcZkCnfZrt16tUMidcIfm.yjUljBxnNbqqATtaeUzh584w7Wk70HG', // password: admin123
        status: AdminUserStatus.ACTIVE,
      }
    });

    // Mixed-shape MediaAssets for cards and avatars
    const m16_9 = await prisma.mediaAsset.create({
      data: { storageKey: 'media-16-9.png', mimeType: 'image/png', size: 2048, altText: '16:9 Landscape Card Image' }
    });
    const m4_3 = await prisma.mediaAsset.create({
      data: { storageKey: 'media-4-3.png', mimeType: 'image/png', size: 2048, altText: '4:3 Standard Card Image' }
    });
    const m1_1 = await prisma.mediaAsset.create({
      data: { storageKey: 'media-1-1.png', mimeType: 'image/png', size: 2048, altText: '1:1 Square Card Image' }
    });
    const m9_16 = await prisma.mediaAsset.create({
      data: { storageKey: 'media-9-16.png', mimeType: 'image/png', size: 2048, altText: '9:16 Portrait Card Image' }
    });
    const m16_9_v = await prisma.mediaAsset.create({
      data: { storageKey: 'media-16-9.mp4', mimeType: 'video/mp4', size: 4096, altText: '16:9 Landscape Card Video' }
    });
    const m9_16_v = await prisma.mediaAsset.create({
      data: { storageKey: 'media-9-16.mp4', mimeType: 'video/mp4', size: 4096, altText: '9:16 Portrait Card Video' }
    });
    const mAvatar = await prisma.mediaAsset.create({
      data: { storageKey: 'avatar-portrait-9-16.png', mimeType: 'image/png', size: 2048, altText: 'Gurmesa Teklemariam Avatar' }
    });
    await prisma.mediaAsset.create({
      data: { storageKey: 'img-1.jpg', mimeType: 'image/jpeg', size: 1024, altText: 'Legacy Fixture 1' }
    });
    await prisma.mediaAsset.create({
      data: { storageKey: 'img-2.png', mimeType: 'image/png', size: 2048, altText: 'Legacy Fixture 2' }
    });

    // Profile (Singleton)
    await prisma.profile.create({
      data: {
        name: 'Gurmesa Teklemariam',
        title: 'Full-Stack Developer & Software Architect',
        tagline: 'Engineering resilient, scalable digital systems',
        bio: 'Full-stack software engineer building enterprise web platforms, scalable microservices, and human-centered design systems with Next.js, Node.js, and cloud architectures.',
        locationLabel: 'Adama, Ethiopia',
        availabilityStatus: 'Available for freelance',
        avatarId: mAvatar.id,
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

    // Services (with mixed media shapes + collision test price + long titles)
    await prisma.service.createMany({
      data: [
        { slug: 'web-development', title: 'Web Development', summary: 'Production-ready full-stack applications with Next.js, React, and robust APIs.', description: 'End-to-end full stack development with modern security, type-safety, and automated CI/CD pipelines.', status: ServiceStatus.PUBLISHED, order: 1, startingPriceRange: '$5000+', featuredImageId: m16_9.id, deliverables: ['Custom Architecture', 'Mobile-Responsive UI', 'Production Deployment'] },
        { slug: 'consulting', title: 'Technical Consulting', summary: 'Architecture advice, performance auditing, and cloud infrastructure optimization.', description: 'Strategic technical guidance for high-load scaling, database tuning, and distributed systems.', status: ServiceStatus.PUBLISHED, order: 2, startingPriceRange: 'Starting at ETB 1,500 per session', featuredImageId: m4_3.id, deliverables: ['System Audits', 'Scalability Roadmaps', 'Security Reviews'] },
        { slug: 'ui-design', title: 'UI/UX Design Systems', summary: 'High-contrast accessible design systems crafted with Tailwind CSS and Radix UI.', description: 'Design systems focused on usability, mobile responsiveness, and fluid interaction dynamics.', status: ServiceStatus.PUBLISHED, order: 3, startingPriceRange: '$3000', featuredImageId: m1_1.id, deliverables: ['Figma Tokens', 'Component Library', 'Accessibility Pass'] },
        { slug: 'mobile-architecture', title: 'Mobile Architecture', summary: 'Responsive mobile-first engineering with offline support and fluid touch interactions.', description: 'Tailored for phone screens from 320px to tablet viewports with high tactile responsiveness.', status: ServiceStatus.PUBLISHED, order: 4, startingPriceRange: '$4500', featuredImageId: m9_16.id, deliverables: ['Touch Gestures', 'Viewport Adaptation', 'Performance Budget'] },
        { slug: 'devops-pipelines', title: 'Cloud & DevOps Automation', summary: 'Automated containerized delivery pipelines with Docker, Redis caching, and health probes.', description: 'Zero-downtime automated workflows, staging test beds, and real-time observability.', status: ServiceStatus.PUBLISHED, order: 5, startingPriceRange: '$3500', featuredImageId: m16_9_v.id, deliverables: ['Docker Compose', 'GitHub Actions', 'Health Check API'] },
        { slug: 'performance-tuning', title: 'Performance Optimization', summary: 'Sub-second Core Web Vitals, image optimization, dynamic SSR caching, and query tuning.', description: 'Audit and eliminate layout shifts, slow SQL queries, and bloated JavaScript payloads.', status: ServiceStatus.PUBLISHED, order: 6, startingPriceRange: '$2500', featuredImageId: m9_16_v.id, deliverables: ['Lighthouse 95+', 'Bundle Splitting', 'Database Indexing'] },
        { slug: 'enterprise-systems', title: 'በከፍተኛ ደረጃ የተደራጀ የሶፍትዌር ግንባታ እና የስርዓት ማሻሻያ አገልግሎት (Advanced Enterprise Architecture & Systems Optimization Service with Long Afaan Oromo Title)', summary: 'Large-scale enterprise workflows with complex business rules, multi-tenant database partitions, and multilingual interfaces in Amharic and Afaan Oromo.', description: 'Custom multi-region enterprise deployments tailored for complex organizational demands.', status: ServiceStatus.PUBLISHED, order: 7, startingPriceRange: '$6000', featuredImageId: null, deliverables: ['Multi-Tenant Core', 'Multilingual Support', 'Audit Logging'] },
        { slug: 'caching-service', title: 'Caching Service', summary: 'Test service', description: 'For caching tests', status: ServiceStatus.PUBLISHED, order: 8 },
        { slug: 'draft-service', title: 'Draft Service', summary: 'Draft service', description: 'Not published yet', status: ServiceStatus.DRAFT, order: 9 }
      ]
    });

    // Technologies
    const tReact = await prisma.technology.create({ data: { name: 'React', category: 'Frontend', slug: 'react' } });
    const tNode = await prisma.technology.create({ data: { name: 'Node.js', category: 'Backend', slug: 'nodejs' } });
    const tPrisma = await prisma.technology.create({ data: { name: 'Prisma', category: 'ORM', slug: 'prisma' } });
    const tNext = await prisma.technology.create({ data: { name: 'Next.js', category: 'Framework', slug: 'nextjs' } });
    const tPostgres = await prisma.technology.create({ data: { name: 'PostgreSQL', category: 'Database', slug: 'postgres' } });
    const tTailwind = await prisma.technology.create({ data: { name: 'Tailwind CSS', category: 'Styling', slug: 'tailwind' } });

    // Projects (with mixed media shapes + long titles + video)
    const p1 = await prisma.project.create({
      data: {
        title: 'Open Source Dashboard',
        slug: 'os-dashboard',
        status: ProjectStatus.DELIVERED,
        confidentiality: ProjectConfidentiality.PUBLIC,
        summary: 'A high-performance real-time analytics dashboard with dark theme and data filtering.',
        technologies: {
          create: [{ technologyId: tReact.id }, { technologyId: tNext.id }, { technologyId: tTailwind.id }]
        },
        caseStudy: {
          create: {
            problem: 'Organizations lacked a unified real-time telemetry viewer.',
            solution: 'Architected a modular Next.js dashboard with instant revalidation.',
            role: 'Lead Architect',
            scope: 'Frontend & APIs',
            architectureSummary: 'Next.js Turbopack with Prisma and Redis caching.',
            outcome: 'Sub-50ms latency across 100,000 monthly events.',
            content: 'Detailed engineering deep-dive on query optimization and rendering trees.',
            status: CaseStudyStatus.PUBLISHED
          }
        }
      }
    });
    await prisma.projectMedia.create({ data: { projectId: p1.id, mediaId: m16_9.id, order: 0, altText: 'Open Source Dashboard' } });

    const p2 = await prisma.project.create({
      data: {
        title: 'Fintech Banking Platform',
        slug: 'fintech-platform',
        status: ProjectStatus.ACTIVE,
        confidentiality: ProjectConfidentiality.ANONYMIZED,
        summary: 'High-scale trading platform with rigorous ACID transactions and multi-tenant ledger.',
        technologies: {
          create: [{ technologyId: tNode.id }, { technologyId: tPrisma.id }, { technologyId: tPostgres.id }]
        },
        caseStudy: {
          create: {
            problem: 'Legacy banking systems failed under peak transaction volume.',
            solution: 'Engineered a resilient event-driven microservices core.',
            role: 'Backend Architect',
            scope: 'Core Ledger & Security',
            architectureSummary: 'Node.js, PostgreSQL with strict row-level security and rate limits.',
            outcome: 'Zero financial discrepancies across 5M processed transfers.',
            content: 'Comprehensive architectural breakdown of transaction isolation levels.',
            status: CaseStudyStatus.PUBLISHED
          }
        }
      }
    });
    await prisma.projectMedia.create({ data: { projectId: p2.id, mediaId: m4_3.id, order: 0, altText: 'Fintech Banking Platform' } });

    const p3 = await prisma.project.create({
      data: {
        title: 'E-Commerce Marketplace',
        slug: 'ecommerce-app',
        status: ProjectStatus.DELIVERED,
        confidentiality: ProjectConfidentiality.PUBLIC,
        summary: 'Multi-vendor marketplace featuring localized payments, inventory sync, and order dispatch.',
        technologies: {
          create: [{ technologyId: tNext.id }, { technologyId: tPostgres.id }]
        },
        caseStudy: {
          create: {
            problem: 'Merchants experienced inventory de-synchronization across stores.',
            solution: 'Built real-time websocket inventory reservations.',
            role: 'Full-Stack Dev',
            scope: 'Storefront & Admin',
            architectureSummary: 'Next.js App Router with transactional checkout locks.',
            outcome: '99.98% inventory accuracy during flash sale campaigns.',
            content: 'Technical analysis of optimistic concurrency in shopping carts.',
            status: CaseStudyStatus.PUBLISHED
          }
        }
      }
    });
    await prisma.projectMedia.create({ data: { projectId: p3.id, mediaId: m1_1.id, order: 0, altText: 'E-Commerce Marketplace' } });

    const p4 = await prisma.project.create({
      data: {
        title: 'Mobile Wallet & Pay App',
        slug: 'mobile-wallet',
        status: ProjectStatus.DELIVERED,
        confidentiality: ProjectConfidentiality.PUBLIC,
        summary: 'Ultra-fast mobile wallet with QR payments, peer transfers, and biometric authentication.',
        technologies: {
          create: [{ technologyId: tReact.id }, { technologyId: tNode.id }]
        },
        caseStudy: {
          create: {
            problem: 'Users struggled with slow payments in low-connectivity environments.',
            solution: 'Implemented offline-first cryptographic payment tokens.',
            role: 'Mobile Specialist',
            scope: 'Client Architecture',
            architectureSummary: 'PWA with service worker caching and secure enclave crypto.',
            outcome: '98% payment success rate even on 2G connections.',
            content: 'Cryptographic offline verification protocol documentation.',
            status: CaseStudyStatus.PUBLISHED
          }
        }
      }
    });
    await prisma.projectMedia.create({ data: { projectId: p4.id, mediaId: m9_16.id, order: 0, altText: 'Mobile Wallet & Pay App' } });

    const p5 = await prisma.project.create({
      data: {
        title: 'Video Streaming Engine',
        slug: 'video-streaming',
        status: ProjectStatus.DELIVERED,
        confidentiality: ProjectConfidentiality.PUBLIC,
        summary: 'Adaptive bitrate media transcode pipeline with low-latency HLS distribution.',
        technologies: {
          create: [{ technologyId: tNode.id }, { technologyId: tNext.id }]
        },
        caseStudy: {
          create: {
            problem: 'Video buffering caused 40% drop-off in remote education platforms.',
            solution: 'Architected dynamic chunk slicing and multi-CDN failover.',
            role: 'Media Engineer',
            scope: 'Transcoding & Delivery',
            architectureSummary: 'FFmpeg workers with edge-cached HLS playlists.',
            outcome: 'Playback start time dropped from 3.8s to 450ms.',
            content: 'Deep-dive on fragmented MP4 chunk generation and CDN caching.',
            status: CaseStudyStatus.PUBLISHED
          }
        }
      }
    });
    await prisma.projectMedia.create({ data: { projectId: p5.id, mediaId: m16_9_v.id, order: 0, altText: 'Video Streaming Engine' } });

    const p6 = await prisma.project.create({
      data: {
        title: 'Social Stories Feed',
        slug: 'story-app',
        status: ProjectStatus.DELIVERED,
        confidentiality: ProjectConfidentiality.PUBLIC,
        summary: 'Ephemeral vertical video stories with gestures, audio sync, and instant reactions.',
        technologies: {
          create: [{ technologyId: tReact.id }, { technologyId: tTailwind.id }]
        },
        caseStudy: {
          create: {
            problem: 'Vertical video feeds choked browser memory on budget smartphones.',
            solution: 'Designed virtualized video pools recycling DOM video elements.',
            role: 'Frontend Performance Eng',
            scope: 'Mobile UX',
            architectureSummary: 'Virtual DOM recycler with IntersectionObserver preloading.',
            outcome: 'Maintained rock-solid 60 FPS scrolling with zero memory leaks.',
            content: 'Virtualization strategy for HTML5 video elements on Android.',
            status: CaseStudyStatus.PUBLISHED
          }
        }
      }
    });
    await prisma.projectMedia.create({ data: { projectId: p6.id, mediaId: m9_16_v.id, order: 0, altText: 'Social Stories Feed' } });

    await prisma.project.create({
      data: {
        title: 'ዘመናዊ የዲጂታል ክፍያና የባንክ አገልግሎት ስርዓት ግንባታ (Next-Gen Omnichannel Banking & Real-Time Financial Settlement Core)',
        slug: 'enterprise-core',
        status: ProjectStatus.DELIVERED,
        confidentiality: ProjectConfidentiality.PUBLIC,
        summary: 'High-availability financial processing engine with Amharic and Afaan Oromo multi-locale reporting.',
        technologies: {
          create: [{ technologyId: tNode.id }, { technologyId: tPostgres.id }]
        },
        caseStudy: {
          create: {
            problem: 'Complex multilingual regulatory reports overwhelmed legacy reporting tools.',
            solution: 'Engineered streaming report generators with localized number systems.',
            role: 'Systems Architect',
            scope: 'Backend & Localization',
            architectureSummary: 'PostgreSQL partitioned tables with streaming JSON exporters.',
            outcome: 'Daily closing reconciliation reduced from 4 hours to 8 minutes.',
            content: 'Architecture overview of real-time transactional ETL pipelines.',
            status: CaseStudyStatus.PUBLISHED
          }
        }
      }
    });

    // Dedicated projects for caching and ACL tests
    await prisma.project.create({
      data: {
        title: 'Caching Dashboard',
        slug: 'caching-dashboard',
        status: ProjectStatus.DELIVERED,
        confidentiality: ProjectConfidentiality.PUBLIC,
        summary: 'For caching test.',
        caseStudy: {
          create: { problem: 'P', solution: 'S', role: 'R', scope: 'S', architectureSummary: 'A', outcome: 'O', content: 'C', status: CaseStudyStatus.PUBLISHED }
        }
      }
    });

    await prisma.project.create({
      data: {
        title: 'Caching Fintech',
        slug: 'caching-fintech',
        status: ProjectStatus.ACTIVE,
        confidentiality: ProjectConfidentiality.ANONYMIZED,
        summary: 'For caching test 2.',
        caseStudy: {
          create: { problem: 'P', solution: 'S', role: 'R', scope: 'S', architectureSummary: 'A', outcome: 'O', content: 'C', status: CaseStudyStatus.PUBLISHED }
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
          create: [{ technologyId: tReact.id }]
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

    await prisma.project.create({
      data: {
        title: 'Unpublished Case Study Project',
        slug: 'unpublished-cs-project',
        status: ProjectStatus.ACTIVE,
        confidentiality: ProjectConfidentiality.PUBLIC,
        summary: 'Public project but drafted case study.',
        caseStudy: {
          create: { problem: 'P', solution: 'S', role: 'R', scope: 'S', architectureSummary: 'A', outcome: 'O', content: 'C', status: CaseStudyStatus.DRAFT }
        }
      }
    });

    // Blog Categories & Tags
    const cat = await prisma.category.create({ data: { name: 'Engineering', slug: 'engineering' } });
    await prisma.tag.create({ data: { name: 'Tutorial', slug: 'tutorial' } });

    // BlogPosts (with mixed media shapes + long titles + video)
    await prisma.blogPost.createMany({
      data: [
        { slug: 'first-post', title: 'First Post: Building Modern Web Architecture', excerpt: 'Deep architectural exploration of Next.js App Router, caching strategies, and resilient data layers.', body: 'Detailed tutorial content on designing robust full-stack applications with high developer velocity.', status: BlogPostStatus.PUBLISHED, categoryId: cat.id, featuredImageId: m16_9.id },
        { slug: 'post-4-3', title: 'Relational Database Optimization & Schema Design', excerpt: 'Practical techniques for PostgreSQL indexing, query planning, and connection pooling under load.', body: 'Complete guide to optimizing relational databases for high-concurrency production workloads.', status: BlogPostStatus.PUBLISHED, categoryId: cat.id, featuredImageId: m4_3.id },
        { slug: 'post-1-1', title: 'State Machines and Resilient UI Workflows', excerpt: 'Eliminating impossible states and race conditions in interactive web applications.', body: 'Implementing deterministic state machines for complex multi-step user transactions.', status: BlogPostStatus.PUBLISHED, categoryId: cat.id, featuredImageId: m1_1.id },
        { slug: 'post-9-16', title: 'Mobile-First Viewport Engineering at Scale', excerpt: 'Why mobile responsiveness is an architectural foundation rather than a desktop afterthought.', body: 'Mastering intrinsic web design, container queries, and sub-400px mobile viewport constraints.', status: BlogPostStatus.PUBLISHED, categoryId: cat.id, featuredImageId: m9_16.id },
        { slug: 'post-16-9-vid', title: 'Video Processing Pipelines in Node.js', excerpt: 'Handling multipart video ingestion, chunked processing, and automated transcode jobs.', body: 'Building asynchronous worker queues for background media encoding and CDN distribution.', status: BlogPostStatus.PUBLISHED, categoryId: cat.id, featuredImageId: m16_9_v.id },
        { slug: 'post-9-16-vid', title: 'Vertical Video Story Architectures', excerpt: 'Optimizing DOM node consumption and hardware-accelerated video rendering on mobile devices.', body: 'Engineering smooth 60fps vertical swipe video feeds on budget Android browsers.', status: BlogPostStatus.PUBLISHED, categoryId: cat.id, featuredImageId: m9_16_v.id },
        { slug: 'post-no-media', title: 'የደመና ቴክኖሎጂ አጠቃቀምና የስርዓት ደህንነት ማረጋገጫ መንገዶች (Modern Cloud Infrastructure & Security Architecture)', excerpt: 'Cloud security fundamentals, encrypted data storage, and zero-trust authentication models.', body: 'Comprehensive overview of building hardened enterprise platforms resistant to automated threat vectors.', status: BlogPostStatus.PUBLISHED, categoryId: cat.id, featuredImageId: null },
        { slug: 'second-post', title: 'Draft Post', excerpt: 'Draft', body: 'Draft Content', status: BlogPostStatus.DRAFT, categoryId: cat.id },
        { slug: 'third-post', title: 'Archived Post', excerpt: 'Archived', body: 'Old content', status: BlogPostStatus.ARCHIVED, categoryId: cat.id },
        { slug: 'caching-post', title: 'Caching Post', excerpt: 'Caching', body: 'For caching tests', status: BlogPostStatus.PUBLISHED, categoryId: cat.id }
      ]
    });

    // Testimonials
    await prisma.testimonial.createMany({
      data: [
        { name: 'Dr. Michael Chen', content: 'Gurmesa delivered our cloud infrastructure ahead of schedule with flawless reliability and sub-second response times.', permissionStatus: TestimonialPermissionStatus.AUTHORIZED, status: TestimonialStatus.PUBLISHED },
        { name: 'Sara Bekele', content: 'Outstanding craftsmanship in design and code. The mobile experience on our platform transformed user retention dramatically.', permissionStatus: TestimonialPermissionStatus.AUTHORIZED, status: TestimonialStatus.PUBLISHED },
        { name: 'Alice Smith', content: 'Great work!', permissionStatus: TestimonialPermissionStatus.AUTHORIZED, status: TestimonialStatus.PUBLISHED },
        { name: 'Bob Jones', content: 'Very good.', permissionStatus: TestimonialPermissionStatus.PENDING, status: TestimonialStatus.DRAFT },
        { name: 'Caching Testimonial', content: 'For caching tests.', permissionStatus: TestimonialPermissionStatus.PENDING, status: TestimonialStatus.DRAFT }
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

    console.log('Seed completed with mixed-shape media fixtures.');
  } finally {
    await prisma.$disconnect();
  }
}

import { fileURLToPath } from 'url';
import path from 'path';

const isDirectRun = Boolean(
  process.argv[1] &&
  (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) ||
   process.argv[1].endsWith('seed.ts') ||
   process.argv[1].endsWith('seed.js'))
);

if (isDirectRun) {
  seed().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
