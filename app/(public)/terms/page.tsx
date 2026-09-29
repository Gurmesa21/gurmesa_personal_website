import Link from 'next/link';
import { TestimonialList } from '@/components/testimonials/TestimonialList';

export const metadata = {
  title: 'Terms of Service - Gurmesa',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="prose">
        <h1>Terms of Service</h1>
        <p>Last updated: September 28, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2>2. Use of Site</h2>
        <p>
          You may use our site for lawful purposes only. You must not use our site in any way that breaches any applicable local, national, or international law or regulation.
        </p>

        <h2>3. Intellectual Property</h2>
        <p>
          The content on this website, including but not limited to case studies, portfolio projects, blog posts, text, and graphics, is the property of Gurmesa and is protected by copyright laws. You may not reproduce or distribute it without explicit permission.
        </p>

        <h2>4. Limitation of Liability</h2>
        <p>
          We will not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use our services or website.
        </p>

        <h2>5. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. We do so by posting and drawing attention to the updated terms on the site. Your decision to continue to visit and make use of the site after such changes have been made constitutes your formal acceptance of the new Terms of Service.
        </p>

        <h2>6. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please <Link href="/contact">contact us</Link>.
        </p>
      </div>

      <TestimonialList />
    </div>
  );
}
