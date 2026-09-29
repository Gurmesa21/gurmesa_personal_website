import { getAdminProfile } from '@/server/services/profileService';
import { ProfileForm } from './ProfileForm';

export default async function AdminProfilePage() {
  const profile = await getAdminProfile();
  if (!profile) return <div>No profile found</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <ProfileForm profile={profile} />
    </div>
  );
}
