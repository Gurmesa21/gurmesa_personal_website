import { PrismaClient } from '@prisma/client';
import { ContactForm } from './ContactForm';
import { TestimonialList } from '@/components/testimonials/TestimonialList';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Contact - Gurmesa',
  description: 'Get in touch for project inquiries or technical consulting.'
};

export default async function ContactPage() {
  const [emailSetting, socialLinks] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: 'publicContactEmail' } }),
    prisma.socialLink.findMany({ where: { visibility: 'PUBLIC' }, orderBy: { order: 'asc' } })
  ]);

  let publicEmail = 'contact@example.com';
  if (emailSetting?.value) {
    try {
      publicEmail = JSON.parse(emailSetting.value as string);
    } catch {
      publicEmail = emailSetting.value as string;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Get in Touch</h1>
        <p className="mt-4 text-xl text-gray-500">
          Have a project in mind? Fill out the form below or reach out directly.
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3">
          
          <div className="p-6 md:col-span-2 border-b md:border-b-0 md:border-r border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
            <ContactForm />
          </div>

          <div className="p-6 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Direct Contact</h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Email</h3>
              <a href={`mailto:${publicEmail}`} className="text-blue-600 hover:underline break-all">
                {publicEmail}
              </a>
            </div>

            {socialLinks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Connect</h3>
                <ul className="space-y-2">
                  {socialLinks.map(link => (
                    <li key={link.id}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {link.label || link.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      <TestimonialList />
    </div>
  );
}
