import { getAdminProfile } from '@/server/services/profileService';
import { prisma } from '@/server/repositories/db';
import { ProfileForm } from './ProfileForm';

export const metadata = {
  title: 'Profile',
};

export default async function AdminProfilePage() {
  const [profile, emailSetting] = await Promise.all([
    getAdminProfile(),
    prisma.siteSetting.findUnique({ where: { key: 'publicContactEmail' } }),
  ]);

  if (!profile) return <div>No profile found</div>;

  let publicContactEmail = '';
  if (emailSetting?.value) {
    try {
      const parsed = JSON.parse(emailSetting.value as string);
      publicContactEmail = typeof parsed === 'string' ? parsed : String(emailSetting.value);
    } catch {
      publicContactEmail = String(emailSetting.value);
    }
    publicContactEmail = publicContactEmail.replace(/^["']|["']$/g, '').trim();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <ProfileForm profile={profile} publicContactEmail={publicContactEmail} />
    </div>
  );
}
