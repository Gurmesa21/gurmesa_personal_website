import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { TestimonialList } from '@/components/testimonials/TestimonialList';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Privacy Policy - Gurmesa',
};

export default async function PrivacyPage() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: 'inquiryRetentionDays' } });
  
  let retentionDays = 365;
  if (setting && setting.value) {
    try {
      retentionDays = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    } catch {
      retentionDays = Number(setting.value) || 365;
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="prose">
        <h1>Privacy Policy</h1>
        <p>Last updated: September 28, 2026</p>

        <h2>1. Information We Collect</h2>
        <p>
          When you submit an inquiry through our contact form, we collect only the information you voluntarily provide:
        </p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Organization (optional)</li>
          <li>Project type (optional)</li>
          <li>Message content</li>
        </ul>
        <p>
          We also record the internal source page from which you submitted the form. <strong>We do not store your raw IP address or user-agent string</strong> in our inquiry records.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use the collected information solely to:
        </p>
        <ul>
          <li>Respond to your project inquiry</li>
          <li>Provide technical consulting services</li>
          <li>Send an automated acknowledgement email (if enabled)</li>
        </ul>

        <h2>3. Data Retention</h2>
        <p>
          We retain your inquiry data for a maximum of <strong>{retentionDays} days</strong>. After this period, your inquiry records are permanently deleted from our database.
        </p>

        <h2>4. Data Sharing and Security</h2>
        <p>
          We do not sell, rent, or trade your personal information to third parties. We use secure email transport to deliver your inquiry to our team.
        </p>

        <h2>5. Contact Us</h2>
        <p>
          If you have questions about this privacy policy, please <Link href="/contact">contact us</Link>.
        </p>
      </div>

      <TestimonialList />
    </div>
  );
}
