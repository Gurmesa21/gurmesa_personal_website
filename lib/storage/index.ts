import { S3StorageAdapter } from './s3';

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
    if (process.env.PLAYWRIGHT_TEST === '1') {
      instance = new MockStorageAdapter();
    } else {
      instance = new S3StorageAdapter();
    }
  }
  return instance;
}
