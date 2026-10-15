import { S3StorageAdapter } from './s3';
import { LocalStorageAdapter } from './local';
import { isTestMode } from '../test-mode';

export interface StorageAdapter {
  upload(file: File, keyPrefix?: string): Promise<{ url: string; key: string; size: number; mimeType: string }>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
}

class MockStorageAdapter implements StorageAdapter {
  async upload(file: File, keyPrefix?: string): Promise<{ url: string; key: string; size: number; mimeType: string }> {
    const uniqueId = crypto.randomUUID();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const key = `${keyPrefix || 'media/'}${uniqueId}.${ext}`;
    return {
      url: await this.getUrl(key),
      key,
      size: file.size,
      mimeType: file.type,
    };
  }

  async delete(_key: string): Promise<void> {
    // No-op
  }

  async getUrl(key: string): Promise<string> {
    return `/mock-storage/${key}`;
  }
}

let instance: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!instance) {
    if (isTestMode()) {
      instance = new MockStorageAdapter();
    } else {
      const hasAccessKey = process.env.STORAGE_ACCESS_KEY || process.env.S3_ACCESS_KEY;
      if (
        !hasAccessKey ||
        hasAccessKey.includes('your-storage') ||
        process.env.NODE_ENV === 'development'
      ) {
        // Fallback to local storage if AWS keys aren't actually configured
        instance = new LocalStorageAdapter();
      } else {
        instance = new S3StorageAdapter();
      }
    }
  }
  return instance;
}
