'use client';

import { useState, useEffect, useRef } from 'react';
import { getMediaListAction, uploadMediaAction, deleteMediaAction } from '@/app/(admin)/admin/media/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, UploadCloud, X, Check, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface MediaAsset {
  id: string;
  storageKey: string;
  mimeType: string;
  size: number;
  altText: string | null;
  url: string;
}

export function MediaPicker({ 
  name = "mediaId", 
  defaultValue = "", 
  value, 
  onChange 
}: { 
  name?: string; 
  defaultValue?: string; 
  value?: string; 
  onChange?: (val: string) => void 
}) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState('');
  const [internalSelectedId, setInternalSelectedId] = useState(defaultValue);
  
  const selectedId = value !== undefined ? value : internalSelectedId;
  
  const handleSelect = (id: string) => {
    const newId = selectedId === id ? '' : id;
    if (onChange) onChange(newId);
    setInternalSelectedId(newId);
  };

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    try {
      const data = await getMediaListAction();
      setMedia(data);
    } catch (err: any) {
      setError('Failed to load media.');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    loadMedia();
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
      await uploadMediaAction(formData);
      await loadMedia();
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
      
      // If the deleted item was selected, unselect it
      if (selectedId === id) {
        if (onChange) onChange('');
        setInternalSelectedId('');
      }
      
      await loadMedia();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  const filteredMedia = media.filter(m => 
    (m.altText || '').toLowerCase().includes(search.toLowerCase()) ||
    m.storageKey.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/20">
      <input type="hidden" name={name} value={selectedId} />

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search media..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9"
          />
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4"
          />
          <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <UploadCloud className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload New'}
          </Button>
        </div>
      </div>

      {error && <div className="text-sm text-destructive font-medium">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto p-1">
        {filteredMedia.map(item => {
          const isSelected = selectedId === item.id;
          return (
            <Card 
              key={item.id} 
              className={`relative cursor-pointer overflow-hidden group transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2 border-primary' : 'hover:border-primary/50'}`}
              onClick={() => handleSelect(item.id)}
            >
              <div className="aspect-square bg-muted relative">
                {item.mimeType.startsWith('video/') ? (
                  <video src={item.url} className="object-cover w-full h-full pointer-events-none" muted />
                ) : (
                  <Image src={item.url} alt={item.altText || 'Media'} fill className="object-cover pointer-events-none" />
                )}
                
                {/* Delete button wrapper - visible on hover */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="h-7 w-7 rounded-full shadow-sm"
                    onClick={(e) => handleDelete(e, item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </Card>
          );
        })}
        {filteredMedia.length === 0 && !isUploading && (
          <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
            No media found.
          </div>
        )}
      </div>
      
      {selectedId && (
        <div className="flex justify-between items-center text-sm pt-2">
          <span className="text-muted-foreground">1 asset selected</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleSelect('')}>
            <X className="h-4 w-4 mr-1" /> Clear selection
          </Button>
        </div>
      )}
    </div>
  );
}
