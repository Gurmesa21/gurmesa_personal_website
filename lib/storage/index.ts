import { S3StorageAdapter, getExtensionFromMime } from './s3';
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
    const ext = getExtensionFromMime(file.type, file.name);
    const prefix = keyPrefix ? (keyPrefix.endsWith('/') ? keyPrefix : `${keyPrefix}/`) : 'media/';
    const key = `${prefix}${uniqueId}.${ext}`;
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

export function hasValidStorageConfig(): boolean {
  const accessKey = (process.env.STORAGE_ACCESS_KEY || '').trim();
  const secretKey = (process.env.STORAGE_SECRET_KEY || '').trim();
  const endpoint = (process.env.STORAGE_ENDPOINT || '').trim();
  const bucket = (process.env.STORAGE_BUCKET || '').trim();

  if (!accessKey || !secretKey || !endpoint || !bucket) {
    return false;
  }

  if (
    accessKey.includes('your-') ||
    accessKey.includes('nak_live_...') ||
    secretKey.includes('your-') ||
    secretKey.includes('nsk_live_...') ||
    endpoint.includes('<endpoint>')
  ) {
    return false;
  }

  return true;
}

export function getStorageAdapter(): StorageAdapter {
  if (!instance) {
    if (isTestMode()) {
      instance = new MockStorageAdapter();
    } else {
      if (hasValidStorageConfig()) {
        instance = new S3StorageAdapter();
      } else {
        const isProduction =
          process.env.APP_ENV === 'production' ||
          (process.env.NODE_ENV === 'production' &&
            process.env.APP_ENV !== 'development' &&
            process.env.APP_ENV !== 'test');

        if (isProduction) {
          throw new Error(
            'Object storage configuration (STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, STORAGE_BUCKET) is missing or invalid in production.'
          );
        }

        instance = new LocalStorageAdapter();
      }
    }
  }
  return instance;
}

export function resetStorageAdapter(): void {
  instance = null;
}
