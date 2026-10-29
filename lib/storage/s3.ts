import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageAdapter } from './index';

export function getExtensionFromMime(mimeType: string, filename?: string): string {
  const mime = mimeType?.toLowerCase().trim();
  switch (mime) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    case 'application/pdf':
      return 'pdf';
    case 'video/mp4':
      return 'mp4';
    case 'image/svg+xml':
      return 'svg';
    case 'image/avif':
      return 'avif';
    case 'video/webm':
      return 'webm';
    case 'video/quicktime':
      return 'mov';
    default: {
      const ext = filename?.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
      return ext && ext.length <= 5 ? ext : 'bin';
    }
  }
}

export class S3StorageAdapter implements StorageAdapter {
  private client: S3Client;
  private bucket: string;
  private publicUrl?: string;

  constructor() {
    this.bucket = process.env.STORAGE_BUCKET || 'avenor-media';
    const publicUrl = process.env.STORAGE_PUBLIC_URL;
    this.publicUrl = publicUrl && publicUrl.trim().length > 0 ? publicUrl.trim() : undefined;

    const endpoint = process.env.STORAGE_ENDPOINT;
    const region = process.env.STORAGE_REGION || 'us-east-2';
    const accessKeyId = process.env.STORAGE_ACCESS_KEY || '';
    const secretAccessKey = process.env.STORAGE_SECRET_KEY || '';

    this.client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      // Neon Object Storage requires path-style addressing
      forcePathStyle: true,
    });
  }

  async upload(file: File, keyPrefix: string = 'media/'): Promise<{ url: string; key: string; size: number; mimeType: string }> {
    const uniqueId = crypto.randomUUID();
    const ext = getExtensionFromMime(file.type, file.name);
    const prefix = keyPrefix.endsWith('/') ? keyPrefix : `${keyPrefix}/`;
    const finalPrefix = keyPrefix ? prefix : '';
    const key = `${finalPrefix}${uniqueId}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await this.client.send(command);

    return {
      url: await this.getUrl(key),
      key,
      size: file.size,
      mimeType: file.type,
    };
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.client.send(command);
  }

  async getUrl(key: string): Promise<string> {
    const rawPublicUrl = (process.env.STORAGE_PUBLIC_URL || this.publicUrl || '').trim();
    if (rawPublicUrl) {
      const baseUrl = rawPublicUrl.endsWith('/') ? rawPublicUrl.slice(0, -1) : rawPublicUrl;
      const cleanKey = key.startsWith('/') ? key.slice(1) : key;
      if (baseUrl.endsWith(`/${this.bucket}`)) {
        return `${baseUrl}/${cleanKey}`;
      }
      return `${baseUrl}/${this.bucket}/${cleanKey}`;
    }

    // For private bucket: generate presigned GET URL
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn: 3600 * 24 * 7 });
  }
}
