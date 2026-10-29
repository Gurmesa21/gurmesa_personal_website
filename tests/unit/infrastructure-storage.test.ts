import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getExtensionFromMime, S3StorageAdapter } from '@/lib/storage/s3';
import { getStorageAdapter, hasValidStorageConfig, resetStorageAdapter } from '@/lib/storage';
import { LocalStorageAdapter } from '@/lib/storage/local';

describe('Neon Object Storage - S3 Infrastructure Configuration', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    resetStorageAdapter();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetStorageAdapter();
  });

  describe('MIME-derived extensions', () => {
    it('maps image/jpeg to jpg', () => {
      expect(getExtensionFromMime('image/jpeg', 'photo.jpeg')).toBe('jpg');
      expect(getExtensionFromMime('image/jpeg', 'photo.png')).toBe('jpg');
    });

    it('maps image/png to png', () => {
      expect(getExtensionFromMime('image/png', 'doc.jpg')).toBe('png');
    });

    it('maps image/gif to gif', () => {
      expect(getExtensionFromMime('image/gif', 'anim.bin')).toBe('gif');
    });

    it('maps image/webp to webp', () => {
      expect(getExtensionFromMime('image/webp', 'image.bin')).toBe('webp');
    });

    it('maps application/pdf to pdf', () => {
      expect(getExtensionFromMime('application/pdf', 'resume.doc')).toBe('pdf');
    });

    it('maps video/mp4 to mp4', () => {
      expect(getExtensionFromMime('video/mp4', 'movie.mov')).toBe('mp4');
    });
  });

  describe('S3 Client initialization with canonical STORAGE_* variables', () => {
    it('initializes with default bucket avenor-media and forcePathStyle: true', () => {
      vi.stubEnv('STORAGE_BUCKET', 'avenor-media');
      vi.stubEnv('STORAGE_REGION', 'us-east-2');
      vi.stubEnv('STORAGE_ENDPOINT', 'https://br-raspy-math-b5fl7dc6.storage.c-7.us-east-2.aws.neon.tech');
      vi.stubEnv('STORAGE_ACCESS_KEY', 'nak_live_test_key');
      vi.stubEnv('STORAGE_SECRET_KEY', 'nsk_live_test_secret');
      vi.stubEnv('STORAGE_PUBLIC_URL', '');

      const adapter = new S3StorageAdapter();
      expect(adapter).toBeInstanceOf(S3StorageAdapter);
    });

    it('treats empty or whitespace STORAGE_PUBLIC_URL as private bucket (no invalid public URL)', async () => {
      vi.stubEnv('STORAGE_BUCKET', 'avenor-media');
      vi.stubEnv('STORAGE_REGION', 'us-east-2');
      vi.stubEnv('STORAGE_ENDPOINT', 'https://br-raspy-math-b5fl7dc6.storage.c-7.us-east-2.aws.neon.tech');
      vi.stubEnv('STORAGE_ACCESS_KEY', 'nak_live_test_key');
      vi.stubEnv('STORAGE_SECRET_KEY', 'nsk_live_test_secret');
      vi.stubEnv('STORAGE_PUBLIC_URL', '   ');

      const adapter = new S3StorageAdapter();
      // Calling getUrl for a private bucket generates a presigned URL with X-Amz-Signature, not a bare public URL
      const url = await adapter.getUrl('media/test.jpg');
      expect(url).toContain('X-Amz-Signature');
      expect(url).toContain('media/test.jpg');
    });

    it('returns direct public URL when STORAGE_PUBLIC_URL is configured', async () => {
      vi.stubEnv('STORAGE_BUCKET', 'avenor-media');
      vi.stubEnv('STORAGE_REGION', 'us-east-2');
      vi.stubEnv('STORAGE_ENDPOINT', 'https://br-raspy-math-b5fl7dc6.storage.c-7.us-east-2.aws.neon.tech');
      vi.stubEnv('STORAGE_ACCESS_KEY', 'nak_live_test_key');
      vi.stubEnv('STORAGE_SECRET_KEY', 'nsk_live_test_secret');
      vi.stubEnv('STORAGE_PUBLIC_URL', 'https://cdn.example.com');

      const adapter = new S3StorageAdapter();
      const url = await adapter.getUrl('media/test.jpg');
      expect(url).toBe('https://cdn.example.com/avenor-media/media/test.jpg');
    });
  });

  describe('Storage provider selection', () => {
    it('selects S3StorageAdapter when valid STORAGE_* configuration is present in development', () => {
      vi.stubEnv('APP_ENV', 'development');
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('PLAYWRIGHT_TEST', '0');
      vi.stubEnv('STORAGE_BUCKET', 'avenor-media');
      vi.stubEnv('STORAGE_REGION', 'us-east-2');
      vi.stubEnv('STORAGE_ENDPOINT', 'https://br-raspy-math-b5fl7dc6.storage.c-7.us-east-2.aws.neon.tech');
      vi.stubEnv('STORAGE_ACCESS_KEY', 'nak_live_valid');
      vi.stubEnv('STORAGE_SECRET_KEY', 'nsk_live_valid');

      expect(hasValidStorageConfig()).toBe(true);
      const adapter = getStorageAdapter();
      expect(adapter).toBeInstanceOf(S3StorageAdapter);
    });

    it('falls back to LocalStorageAdapter when STORAGE_* configuration is missing in development', () => {
      vi.stubEnv('APP_ENV', 'development');
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('PLAYWRIGHT_TEST', '0');
      vi.stubEnv('STORAGE_ACCESS_KEY', '');
      vi.stubEnv('STORAGE_SECRET_KEY', '');

      expect(hasValidStorageConfig()).toBe(false);
      const adapter = getStorageAdapter();
      expect(adapter).toBeInstanceOf(LocalStorageAdapter);
    });

    it('fails configuration explicitly in production when STORAGE_* configuration is missing', () => {
      vi.stubEnv('APP_ENV', 'production');
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('PLAYWRIGHT_TEST', '0');
      vi.stubEnv('STORAGE_ACCESS_KEY', '');
      vi.stubEnv('STORAGE_SECRET_KEY', '');

      expect(hasValidStorageConfig()).toBe(false);
      expect(() => getStorageAdapter()).toThrow(/Object storage configuration.*missing or invalid in production/i);
    });
  });
});
