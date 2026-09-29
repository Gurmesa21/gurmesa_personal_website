'use client';
import { useFormStatus } from 'react-dom';
import { updateProfileAction } from './actions';

export function ProfileForm({ profile }: { profile: any }) {
  return (
    <form action={updateProfileAction} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input name="name" defaultValue={profile.name} required className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input name="title" defaultValue={profile.title} required className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Tagline</label>
        <input name="tagline" defaultValue={profile.tagline} required className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Bio</label>
        <textarea name="bio" defaultValue={profile.bio} required rows={4} className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Location</label>
        <input name="locationLabel" defaultValue={profile.locationLabel || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Availability Status</label>
        <input name="availabilityStatus" defaultValue={profile.availabilityStatus || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="bg-blue-600 text-white px-4 py-2 rounded">
      {pending ? 'Saving...' : 'Save Profile'}
    </button>
  );
}
