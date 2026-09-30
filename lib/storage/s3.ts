import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageAdapter } from './index';

export class S3StorageAdapter implements StorageAdapter {
  private client: S3Client;
  private bucket: string;
  private publicUrlBase?: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'gurmesa-media';
    this.publicUrlBase = process.env.S3_PUBLIC_URL_BASE;
    
    this.client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT, // e.g. for MinIO, DigitalOcean, Cloudflare R2
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
      // Force path style for local testing (MinIO/Localstack) if endpoint is set
      forcePathStyle: !!process.env.S3_ENDPOINT,
    });
  }

  async upload(file: File, keyPrefix: string = 'media/'): Promise<{ url: string; key: string; size: number; mimeType: string }> {
    // Generate safe key
    const uniqueId = crypto.randomUUID();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    // keyPrefix might be empty, ensure no double slashes
    const prefix = keyPrefix.endsWith('/') ? keyPrefix : `${keyPrefix}/`;
    const finalPrefix = keyPrefix ? prefix : '';
    const key = `${finalPrefix}${uniqueId}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      // If we are using a public bucket, we might want ACL: 'public-read'
      // But standard S3 practice now is bucket policies. We will assume bucket policy makes it public,
      // or we return a presigned URL if publicUrlBase is not set.
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
    if (this.publicUrlBase) {
      // e.g. https://cdn.example.com
      const baseUrl = this.publicUrlBase.endsWith('/') ? this.publicUrlBase.slice(0, -1) : this.publicUrlBase;
      return `${baseUrl}/${key}`;
    }

    // Fallback: generate presigned URL (useful for private buckets or local dev)
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn: 3600 * 24 * 7 }); // 7 days
  }
}
