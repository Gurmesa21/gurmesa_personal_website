import { getAdminMedia } from '@/server/services/mediaService';
import { getAdminSiteSettings } from '@/server/services/siteSettingService';
import { Button } from '@/components/ui/button';
import { uploadMediaAction, deleteMediaAction, setAsResumeAction } from './actions';
import { getStorageAdapter } from '@/lib/storage';

export default async function MediaLibraryPage() {
  const mediaAssets = await getAdminMedia();
  const settings = await getAdminSiteSettings();
  const resumeMediaId = settings.find(s => s.key === 'resumeMediaId')?.value as string;
  const storage = getStorageAdapter();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Media Library</h1>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm max-w-xl">
        <h2 className="text-xl font-semibold mb-4">Upload New File</h2>
        <form action={async (formData: FormData) => {
          'use server';
          await uploadMediaAction(formData);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">File (max 5MB)</label>
            <input type="file" name="file" required className="block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alt Text (optional)</label>
            <input type="text" name="altText" className="block w-full border rounded p-2" />
          </div>
          <Button type="submit">Upload</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {await Promise.all(mediaAssets.map(async asset => {
          const url = await storage.getUrl(asset.storageKey);
          const isImage = asset.mimeType.startsWith('image/');
          const inUse = asset._count.projectMedia > 0 || asset._count.featuredPosts > 0 || asset._count.seoOverrides > 0;
          const isResume = asset.id === resumeMediaId;

          return (
            <div key={asset.id} className={`border rounded-lg p-4 space-y-4 ${isResume ? 'ring-2 ring-primary' : ''}`}>
              <div className="aspect-video bg-muted flex items-center justify-center rounded overflow-hidden relative">
                {isImage ? (
                  <img src={url} alt={asset.altText || 'Media'} className="object-contain w-full h-full" />
                ) : (
                  <span className="text-sm text-muted-foreground">{asset.mimeType}</span>
                )}
              </div>
              <div className="text-sm space-y-1">
                <p className="truncate font-mono" title={asset.storageKey}>{asset.storageKey}</p>
                <p>Size: {(asset.size / 1024).toFixed(1)} KB</p>
                {asset.altText && <p>Alt: {asset.altText}</p>}
                <p>Status: {inUse ? 'In Use' : 'Unused'}</p>
                {isResume && <p className="font-bold text-primary">Current Resume</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">View</a>
                </Button>
                
                {asset.mimeType === 'application/pdf' && !isResume && (
                  <form action={setAsResumeAction}>
                    <input type="hidden" name="id" value={asset.id} />
                    <Button type="submit" variant="secondary" size="sm">Set as Resume</Button>
                  </form>
                )}

                {!inUse && !isResume && (
                  <form action={deleteMediaAction}>
                    <input type="hidden" name="id" value={asset.id} />
                    <Button type="submit" variant="destructive" size="sm">Delete</Button>
                  </form>
                )}
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
