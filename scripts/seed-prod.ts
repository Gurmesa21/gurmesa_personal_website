import { PrismaClient, AdminUserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.APP_ENV !== 'production') {
    console.warn('Running seed-prod.ts outside of production environment.');
  }

  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be set in production seed');
  }

  if (password.length < 12) {
    throw new Error('INITIAL_ADMIN_PASSWORD must be at least 12 characters long');
  }

  // Admin User (Check if one exists first to prevent duplicating)
  const existingAdmin = await prisma.adminUser.findFirst();
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(password, 10);
    
    await prisma.adminUser.create({
      data: {
        email,
        name: 'Admin User',
        passwordHash,
        status: AdminUserStatus.ACTIVE,
      }
    });
    console.log('Created default admin user.');
  } else {
    console.log('Admin user already exists. Skipping creation.');
  }

  // Profile (Check if one exists)
  const existingProfile = await prisma.profile.findFirst();
  if (!existingProfile) {
    await prisma.profile.create({
      data: {
        name: 'Admin',
        title: 'Site Administrator',
        tagline: 'Welcome to my site',
        bio: 'Please update your profile.',
      }
    });
    console.log('Created default profile.');
  }

  // SiteSettings (Check if they exist)
  const settingsCount = await prisma.siteSetting.count();
  if (settingsCount === 0) {
    await prisma.siteSetting.createMany({
      data: [
        { key: 'inquiryRetentionDays', value: 365, type: 'number' },
        { key: 'sendVisitorAcknowledgement', value: false, type: 'boolean' },
        { key: 'publicContactEmail', value: JSON.stringify(email), type: 'string' },
      ]
    });
    console.log('Created default site settings.');
  }

  console.log('Production seed completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
