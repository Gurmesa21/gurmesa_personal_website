import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAdminMedia } from '@/server/services/mediaService';
import { getAdminSiteSettings } from '@/server/services/siteSettingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { uploadMediaAction, deleteMediaAction, setAsResumeAction } from './actions';
import { getStorageAdapter } from '@/lib/storage';
import { FolderOpen, UploadCloud, Search, FileText, Trash2, ExternalLink, FileCheck, Filter, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Media Library | Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/admin/login');
  }

  const resolvedParams = await searchParams;
  const q = (resolvedParams.q || '').toLowerCase().trim();
  const typeFilter = resolvedParams.type || 'ALL';

  const [mediaAssets, settings] = await Promise.all([
    getAdminMedia(),
    getAdminSiteSettings(),
  ]);

  const resumeMediaId = settings.find((s) => s.key === 'resumeMediaId')?.value as string;
  const storage = getStorageAdapter();

  // Filter assets
  const filteredAssets = mediaAssets.filter((asset) => {
    const matchesSearch =
      !q ||
      asset.storageKey.toLowerCase().includes(q) ||
      (asset.altText && asset.altText.toLowerCase().includes(q)) ||
      asset.mimeType.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (typeFilter === 'IMAGES') return asset.mimeType.startsWith('image/');
    if (typeFilter === 'VIDEOS') return asset.mimeType.startsWith('video/');
    if (typeFilter === 'DOCS') return asset.mimeType === 'application/pdf';
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-primary" />
            Media Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Centralized management for images, videos, and documents across your portfolio.
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-card px-3.5 py-1.5 rounded-lg border border-border">
          Total Files: <span className="font-semibold text-foreground">{mediaAssets.length}</span>
        </div>
      </div>

      {/* Upload New File Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-primary" />
            Upload New Media File
          </CardTitle>
          <CardDescription>
            Supported formats: JPEG, PNG, GIF, WebP, MP4, and PDF (max 10MB). Files are validated and safely stored.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              'use server';
              await uploadMediaAction(formData);
            }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          >
            <div className="md:col-span-5 space-y-1.5">
              <label htmlFor="file-upload" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select File
              </label>
              <Input
                id="file-upload"
                type="file"
                name="file"
                required
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,application/pdf"
                className="bg-background file:bg-muted file:text-foreground file:border-0 file:rounded-md file:text-xs file:font-semibold file:mr-3"
              />
            </div>
            <div className="md:col-span-5 space-y-1.5">
              <label htmlFor="alt-text-input" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Alt Text / Description (Optional)
              </label>
              <Input
                id="alt-text-input"
                type="text"
                name="altText"
                placeholder="Accessible description or label..."
                className="bg-background"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full gap-2">
                <UploadCloud className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <form method="get" className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search by filename, description, or MIME type..."
                className="pl-9 bg-background w-full"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                name="type"
                defaultValue={typeFilter}
                className="flex h-9 rounded-md border border-input bg-card text-foreground px-3 py-1 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-auto"
              >
                <option value="ALL" className="bg-[#101426] text-[#F5F6FC]">All Media Types</option>
                <option value="IMAGES" className="bg-[#101426] text-[#F5F6FC]">Images</option>
                <option value="VIDEOS" className="bg-[#101426] text-[#F5F6FC]">Videos</option>
                <option value="DOCS" className="bg-[#101426] text-[#F5F6FC]">Documents (PDF)</option>
              </select>

              {(q || typeFilter !== 'ALL') && (
                <Button variant="ghost" size="sm" asChild className="gap-1 text-xs text-muted-foreground hover:text-foreground shrink-0">
                  <Link href="/admin/media">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </Link>
                </Button>
              )}

              <Button type="submit" size="sm" className="gap-1.5 shrink-0">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredAssets.length} of {mediaAssets.length} media file{mediaAssets.length === 1 ? '' : 's'}
        </div>

        {filteredAssets.length === 0 ? (
          <Card className="bg-card border-border py-16 text-center text-muted-foreground space-y-3">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="text-base font-medium">No media files found.</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {q || typeFilter !== 'ALL'
                ? 'No media files match your current search or filter criteria.'
                : 'Upload an image, video, or document to get started.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {await Promise.all(
              filteredAssets.map(async (asset) => {
                const url = await storage.getUrl(asset.storageKey);
                const isImage = asset.mimeType.startsWith('image/');
                const isVideo = asset.mimeType.startsWith('video/') || asset.storageKey.endsWith('.mp4') || asset.storageKey.endsWith('.webm');
                const isPdf = asset.mimeType === 'application/pdf';
                const inUse =
                  (asset._count?.projectMedia || 0) > 0 ||
                  (asset._count?.featuredPosts || 0) > 0 ||
                  (asset._count?.seoOverrides || 0) > 0 ||
                  (asset._count?.services || 0) > 0 ||
                  (asset._count?.profiles || 0) > 0;
                const isResume = asset.id === resumeMediaId;

                const formattedSize =
                  asset.size < 1024 * 1024
                    ? `${(asset.size / 1024).toFixed(1)} KB`
                    : `${(asset.size / (1024 * 1024)).toFixed(1)} MB`;

                const formattedDate = new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }).format(new Date(asset.createdAt));

                return (
                  <Card
                    key={asset.id}
                    className={`bg-card border-border overflow-hidden flex flex-col justify-between transition-all hover:border-primary/50 ${
                      isResume ? 'ring-2 ring-primary border-primary' : ''
                    }`}
                  >
                    <div>
                      {/* Media Preview Box */}
                      <div className="aspect-video bg-muted/40 relative flex items-center justify-center overflow-hidden border-b border-border">
                        {isImage ? (
                          <img
                            src={url}
                            alt={asset.altText || asset.storageKey}
                            className="object-contain w-full h-full max-h-48"
                          />
                        ) : isVideo ? (
                          <video className="w-full h-full object-cover" controls playsInline preload="metadata" muted>
                            <source src={url} type={asset.mimeType.startsWith('video/') ? asset.mimeType : 'video/mp4'} />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground p-6">
                            <FileText className="h-12 w-12 text-primary" />
                            <span className="text-xs font-mono font-medium uppercase">{asset.mimeType}</span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                          {isResume && (
                            <Badge variant="default" className="text-[10px] gap-1 shadow-sm">
                              <FileCheck className="h-3 w-3" />
                              Current Resume
                            </Badge>
                          )}
                          <Badge variant={inUse ? 'secondary' : 'outline'} className="text-[10px] shadow-sm">
                            {inUse ? 'In Use' : 'Unused'}
                          </Badge>
                        </div>
                      </div>

                      {/* File Details */}
                      <CardContent className="p-4 space-y-2 text-xs">
                        <div className="font-mono font-semibold text-foreground truncate" title={asset.storageKey}>
                          {asset.storageKey.replace(/^media\//, '')}
                        </div>
                        {asset.altText && (
                          <div className="text-muted-foreground italic truncate" title={asset.altText}>
                            &ldquo;{asset.altText}&rdquo;
                          </div>
                        )}
                        <div className="flex justify-between items-center text-muted-foreground pt-1 border-t border-border/50 text-[11px]">
                          <span>{formattedSize}</span>
                          <span>{asset.mimeType}</span>
                          <span>{formattedDate}</span>
                        </div>
                      </CardContent>
                    </div>

                    {/* Actions Bar */}
                    <div className="p-4 pt-0 border-t border-border/40 flex items-center justify-between gap-2 bg-muted/10 mt-auto">
                      <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs h-8">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </a>
                      </Button>

                      <div className="flex items-center gap-2">
                        {isPdf && !isResume && (
                          <form action={setAsResumeAction}>
                            <input type="hidden" name="id" value={asset.id} />
                            <Button type="submit" variant="secondary" size="sm" className="text-xs h-8">
                              Set as Resume
                            </Button>
                          </form>
                        )}

                        {!inUse && !isResume && (
                          <form action={deleteMediaAction}>
                            <input type="hidden" name="id" value={asset.id} />
                            <Button
                              type="submit"
                              variant="destructive"
                              size="sm"
                              className="text-xs h-8 gap-1"
                              title="Delete media file"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
