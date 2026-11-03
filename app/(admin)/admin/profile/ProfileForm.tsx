'use client';
import { useFormStatus } from 'react-dom';
import { updateProfileAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { AlertCircle } from 'lucide-react';

export function ProfileForm({ profile, publicContactEmail }: { profile: any; publicContactEmail?: string }) {
  const [avatarId, setAvatarId] = useState(profile?.avatarId || '');
  const [isLandscape, setIsLandscape] = useState(false);

  const checkLandscape = (url: string) => {
    if (!url) {
      setIsLandscape(false);
      return;
    }
    const isVideo = url.endsWith('.mp4') || url.endsWith('.webm');
    if (isVideo) {
      const vid = document.createElement('video');
      vid.onloadedmetadata = () => {
        setIsLandscape(vid.videoWidth > vid.videoHeight);
      };
      vid.onerror = () => setIsLandscape(false);
      vid.src = url;
    } else {
      const img = new Image();
      img.onload = () => {
        setIsLandscape(img.naturalWidth > img.naturalHeight);
      };
      img.onerror = () => setIsLandscape(false);
      img.src = url;
    }
  };

  useEffect(() => {
    let active = true;
    if (profile?.avatarUrl) {
      const url = profile.avatarUrl;
      const isVideo = url.endsWith('.mp4') || url.endsWith('.webm');
      if (isVideo) {
        const vid = document.createElement('video');
        vid.onloadedmetadata = () => {
          if (active) setIsLandscape(vid.videoWidth > vid.videoHeight);
        };
        vid.src = url;
      } else {
        const img = new Image();
        img.onload = () => {
          if (active) setIsLandscape(img.naturalWidth > img.naturalHeight);
        };
        img.src = url;
      }
    }
    return () => {
      active = false;
    };
  }, [profile?.avatarUrl]);

  return (
    <form action={updateProfileAction} className="space-y-6 max-w-2xl bg-card border border-border p-6 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="publicContactEmail">Public Contact Email</Label>
        <Input
          id="publicContactEmail"
          name="publicContactEmail"
          type="email"
          placeholder="contact@example.com"
          defaultValue={publicContactEmail || ''}
        />
        <p className="text-xs text-muted-foreground">The email address displayed publicly on your Contact page.</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Avatar / Headshot</Label>
          <span className="text-xs text-muted-foreground" data-testid="avatar-recommended-hint">
            Recommended: 9:16 vertical (e.g. 720x1280)
          </span>
        </div>

        <MediaPicker
          name="avatarId"
          value={avatarId}
          onChange={setAvatarId}
          onAssetChange={(asset) => {
            if (asset?.url) {
              checkLandscape(asset.url);
            } else {
              setIsLandscape(false);
            }
          }}
        />

        {isLandscape && (
          <div
            data-testid="avatar-landscape-warning"
            className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Uploaded image is landscape. It will be centered and scaled with letterboxing; a 9:16 vertical photo looks best.
            </span>
          </div>
        )}
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
