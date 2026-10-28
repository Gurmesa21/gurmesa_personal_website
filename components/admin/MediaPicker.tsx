'use client';

import { useState, useEffect, useRef } from 'react';
import { getMediaListAction, uploadMediaAction, deleteMediaAction } from '@/app/(admin)/admin/media/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  UploadCloud,
  X,
  Check,
  Trash2,
  FolderOpen,
  ArrowLeft,
  FileImage,
} from 'lucide-react';

interface MediaAsset {
  id: string;
  storageKey: string;
  mimeType: string;
  size: number;
  altText: string | null;
  url: string;
}

export interface MediaPickerProps {
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  accept?: string;
  label?: string;
}

export function MediaPicker({
  name = 'mediaId',
  defaultValue = '',
  value,
  onChange,
  accept = 'image/jpeg,image/png,image/gif,image/webp,video/mp4',
  label = 'Select Media File',
}: MediaPickerProps) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState('');
  const [internalSelectedId, setInternalSelectedId] = useState(defaultValue);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedId = value !== undefined ? value : internalSelectedId;

  // Modal dialog state for centralized media selection flow
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedId, setTempSelectedId] = useState(selectedId);

  const handleSelect = (id: string, forceSelect?: boolean) => {
    const newId = (!forceSelect && selectedId === id) ? '' : id;
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = newId;
      hiddenInputRef.current.setAttribute('value', newId);
      hiddenInputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      hiddenInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (onChange) onChange(newId);
    setInternalSelectedId(newId);
    setTempSelectedId(newId);
  };

  const handleConfirmModalSelection = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = tempSelectedId;
      hiddenInputRef.current.setAttribute('value', tempSelectedId);
      hiddenInputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      hiddenInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (onChange) onChange(tempSelectedId);
    setInternalSelectedId(tempSelectedId);
    setIsModalOpen(false);
  };

  const [prevDefault, setPrevDefault] = useState(defaultValue);
  if (defaultValue !== prevDefault) {
    setPrevDefault(defaultValue);
    setInternalSelectedId(defaultValue);
    setTempSelectedId(defaultValue);
  }

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadMedia() {
      try {
        const data = await getMediaListAction();
        if (!ignore) {
          setMedia(data);
        }
      } catch {
        if (!ignore) {
          setError('Failed to load media.');
        }
      }
    }
    loadMedia();
    return () => {
      ignore = true;
    };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name);
      const result = await uploadMediaAction(formData);
      if (result && !result.ok) throw new Error(result.error);
      const updatedMedia = await getMediaListAction();
      setMedia(updatedMedia);

      // Auto-select the newly uploaded asset
      const newlyUploaded = updatedMedia.find(
        (m) => m.altText === file.name || m.storageKey.includes(file.name)
      );
      if (newlyUploaded) {
        handleSelect(newlyUploaded.id);
        setTempSelectedId(newlyUploaded.id);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this media file?')) return;

    try {
      const formData = new FormData();
      formData.append('id', id);
      await deleteMediaAction(formData);

      if (selectedId === id) {
        if (onChange) onChange('');
        setInternalSelectedId('');
        setTempSelectedId('');
      }

      const updatedMedia = await getMediaListAction();
      setMedia(updatedMedia);
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  const selectedAsset = media.find((m) => m.id === selectedId);

  const filteredMedia = media.filter((m) => {
    const matchesSearch =
      (m.altText || '').toLowerCase().includes(search.toLowerCase()) ||
      m.storageKey.toLowerCase().includes(search.toLowerCase());
    const isImageOrVideo = m.mimeType.startsWith('image/') || m.mimeType.startsWith('video/');
    return matchesSearch && isImageOrVideo;
  });

  return (
    <div className="space-y-3">
      {/* Hidden inputs storing the mediaId for form submission and upload trigger */}
      <input ref={hiddenInputRef} type="hidden" name={name} value={selectedId || ''} onChange={() => {}} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept={accept}
      />

      {/* Selected Media Preview & Selection Trigger Control */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3.5 bg-card border border-border rounded-lg shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {selectedAsset ? (
            <div
              onClick={() => handleSelect(selectedAsset.id, true)}
              className="relative h-14 w-14 rounded-md overflow-hidden bg-muted border border-border shrink-0 cursor-pointer"
            >
              {selectedAsset.mimeType.startsWith('video/') || selectedAsset.storageKey.endsWith('.mp4') ? (
                <video src={selectedAsset.url} className="h-full w-full object-cover pointer-events-none" muted autoPlay loop playsInline preload="auto" />
              ) : (
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.altText || 'Selected preview'}
                  className="h-full w-full object-cover pointer-events-none"
                />
              )}
            </div>
          ) : (
            <div className="h-14 w-14 rounded-md bg-muted/60 border border-dashed border-border flex items-center justify-center shrink-0 text-muted-foreground">
              <FileImage className="h-6 w-6 opacity-60" />
            </div>
          )}

          <div className="min-w-0 space-y-0.5">
            <div className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-sm">
              {selectedAsset ? selectedAsset.altText || selectedAsset.storageKey.replace(/^media\//, '') : 'No media file selected'}
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedAsset ? (
                <span>1 asset selected &bull; {selectedAsset.mimeType} &bull; {(selectedAsset.size / 1024).toFixed(1)} KB</span>
              ) : (
                'Choose an image or video from the library'
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          {isUploading && (
            <span className="text-xs text-primary font-medium animate-pulse flex items-center gap-1">
              Uploading...
            </span>
          )}
          {selectedId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSelect('')}
              className="text-xs text-muted-foreground hover:text-destructive h-8"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear selection
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="select-media-file-btn"
            onClick={() => {
              setTempSelectedId(selectedId);
              setIsModalOpen(true);
            }}
            className="gap-1.5 text-xs h-8 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            {selectedId ? 'Change Media File' : label}
          </Button>
        </div>
      </div>

      {error && !isModalOpen && <div className="text-xs text-destructive font-medium">{error}</div>}

      {/* Modal Selection Dialog (Centralized Media Library selection flow) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6 bg-card border-border">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2 font-bold">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  Media Library — Select Media File
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Choose an existing file or upload a new one. Returning to form preserves all your unsaved edits.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Modal Search and Upload Row */}
          <div className="flex flex-col sm:flex-row gap-3 py-3 border-b border-border/60">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media by name or label..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background h-9 text-xs"
              />
            </div>
            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-1.5 text-xs h-9 w-full sm:w-auto"
              >
                <UploadCloud className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload New File'}
              </Button>
            </div>
          </div>

          {error && <div className="text-xs text-destructive font-medium">{error}</div>}

          {/* Modal Grid of Media */}
          <div className="flex-1 overflow-y-auto py-2 pr-1 min-h-[280px] max-h-[360px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredMedia.map((item) => {
                const isSelected = tempSelectedId === item.id;
                return (
                  <Card
                    key={item.id}
                    data-testid="modal-media-card"
                    data-alt={item.altText || ''}
                    className={`relative cursor-pointer overflow-hidden group transition-all border ${
                      isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setTempSelectedId(tempSelectedId === item.id ? '' : item.id)}
                    onDoubleClick={() => {
                      handleSelect(item.id);
                      setIsModalOpen(false);
                    }}
                  >
                    <div className="aspect-square bg-muted relative">
                      {item.mimeType.startsWith('video/') || item.storageKey.endsWith('.mp4') ? (
                        <video src={item.url} className="object-cover w-full h-full pointer-events-none" muted autoPlay loop playsInline preload="metadata" />
                      ) : (
                        <img src={item.url} alt={item.altText || 'Media'} className="object-cover w-full h-full pointer-events-none" />
                      )}

                      <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 rounded-full shadow-sm bg-destructive"
                          onClick={(e) => handleDelete(e, item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow z-10">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-[11px] truncate font-medium text-foreground">
                      {item.altText || item.storageKey.replace(/^media\//, '')}
                    </div>
                  </Card>
                );
              })}
              {filteredMedia.length === 0 && !isUploading && (
                <div className="col-span-full py-12 text-center text-muted-foreground text-xs">
                  No media files found matching your search.
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer with "Back to Form" action */}
          <DialogFooter className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {tempSelectedId ? '1 asset selected' : 'No file selected'}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Form
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!tempSelectedId}
                onClick={handleConfirmModalSelection}
                className="gap-1.5 text-xs"
              >
                <Check className="h-3.5 w-3.5" />
                Select Media File
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
