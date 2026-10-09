import { StorageAdapter } from './index';
import { promises as fs } from 'fs';
import path from 'path';

export class LocalStorageAdapter implements StorageAdapter {
  private uploadDir: string;

  constructor() {
    // We save to public/uploads so it's accessible via the web server natively
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
  }

  private async ensureDir(dirPath: string) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  async upload(file: File, keyPrefix: string = 'media/'): Promise<{ url: string; key: string; size: number; mimeType: string }> {
    const uniqueId = crypto.randomUUID();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    
    // keyPrefix might be empty, ensure no double slashes
    const prefix = keyPrefix.endsWith('/') ? keyPrefix : `${keyPrefix}/`;
    const finalPrefix = keyPrefix ? prefix : '';
    const key = `${finalPrefix}${uniqueId}.${ext}`;

    const targetPath = path.join(this.uploadDir, key);
    
    // Ensure the directory for this specific file exists
    await this.ensureDir(path.dirname(targetPath));

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(targetPath, buffer);

    return {
      url: await this.getUrl(key),
      key,
      size: file.size,
      mimeType: file.type,
    };
  }

  async delete(key: string): Promise<void> {
    const targetPath = path.join(this.uploadDir, key);
    try {
      await fs.unlink(targetPath);
    } catch (error) {
      console.warn(`Failed to delete local file ${targetPath}:`, error);
    }
  }

  async getUrl(key: string): Promise<string> {
    // Because it's in public/uploads, we just return the path relative to the root
    return `/uploads/${key}`;
  }
}
