'use client';
import { useFormStatus } from 'react-dom';
import { updateProfileAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { MediaPicker } from '@/components/admin/MediaPicker';

export function ProfileForm({ profile }: { profile: any }) {
  const [avatarId, setAvatarId] = useState(profile?.avatarId || '');
  return (
    <form action={updateProfileAction} className="space-y-6 max-w-2xl bg-card border border-border p-6 rounded-lg">
      <div className="space-y-2">
        <Label>Avatar / Headshot</Label>
        <MediaPicker name="avatarId" value={avatarId} onChange={setAvatarId} />
      </div>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input name="name" defaultValue={profile?.name} required />
      </div>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" defaultValue={profile?.title} required />
      </div>
      <div className="space-y-2">
        <Label>Tagline</Label>
        <Input name="tagline" defaultValue={profile?.tagline} required />
      </div>
      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea name="bio" defaultValue={profile?.bio} required rows={4} />
      </div>
      <div className="space-y-2">
        <Label>Location</Label>
        <Input name="locationLabel" defaultValue={profile?.locationLabel || ''} />
      </div>
      <div className="space-y-2">
        <Label>Availability Status</Label>
        <Input name="availabilityStatus" defaultValue={profile?.availabilityStatus || ''} />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Profile'}
    </Button>
  );
}
