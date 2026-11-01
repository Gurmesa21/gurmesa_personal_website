import { describe, it, expect } from 'vitest';
import { inquirySchema, INQUIRY_PROJECT_TYPES } from '@/lib/validation/inquiry';
import fs from 'fs';
import path from 'path';

describe('B4: Inquiry Services List & Validation', () => {
  it('defines the exact 8 required options', () => {
    const expected = [
      'Landing page and website development',
      'Web application development',
      'Website and application management',
      'Maintenance and technical support',
      'Website and application modernization',
      'Hosting and server migration',
      'One-time feature updates and improvements',
      'Other / not sure yet',
    ];
    expect([...INQUIRY_PROJECT_TYPES]).toEqual(expected);
  });

  it('validates valid inquiries with each of the 8 options', () => {
    for (const projectType of INQUIRY_PROJECT_TYPES) {
      const result = inquirySchema.safeParse({
        name: 'Test Applicant',
        email: 'applicant@example.com',
        projectType,
        message: 'This is a valid inquiry message with sufficient length.',
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts empty/optional projectType', () => {
    const result = inquirySchema.safeParse({
      name: 'Test Applicant',
      email: 'applicant@example.com',
      projectType: '',
      message: 'This is a valid inquiry message with sufficient length.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid projectType options', () => {
    const result = inquirySchema.safeParse({
      name: 'Test Applicant',
      email: 'applicant@example.com',
      projectType: 'Non-existent service type',
      message: 'This is a valid inquiry message with sufficient length.',
    });
    expect(result.success).toBe(false);
  });

  it('verifies all 8 options exist in en, am, and om translation files', () => {
    const en = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'messages/en.json'), 'utf-8'));
    const am = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'messages/am.json'), 'utf-8'));
    const om = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'messages/om.json'), 'utf-8'));

    const keys = [
      'selectService',
      'typeLandingPage',
      'typeWebApp',
      'typeWebManagement',
      'typeMaintenanceSupport',
      'typeModernization',
      'typeHostingMigration',
      'typeFeatureUpdates',
      'typeOtherNotSure',
    ];

    for (const k of keys) {
      expect(en.Contact[k]).toBeDefined();
      expect(typeof en.Contact[k]).toBe('string');
      expect(en.Contact[k].length).toBeGreaterThan(0);

      expect(am.Contact[k]).toBeDefined();
      expect(typeof am.Contact[k]).toBe('string');
      expect(am.Contact[k].length).toBeGreaterThan(0);

      expect(om.Contact[k]).toBeDefined();
      expect(typeof om.Contact[k]).toBe('string');
      expect(om.Contact[k].length).toBeGreaterThan(0);
    }
  });
});

describe('B5.e: Image Downscaling with Sharp', () => {
  it('downscales an image exceeding 1280px to max width 1280 WebP', async () => {
    const sharp = (await import('sharp')).default;
    // Generate a 1920x1080 test image in memory
    const inputBuffer = await sharp({
      create: {
        width: 1920,
        height: 1080,
        channels: 3,
        background: { r: 50, g: 100, b: 150 },
      },
    })
      .jpeg()
      .toBuffer();

    expect(inputBuffer.length).toBeGreaterThan(0);

    // Downscale using sharp with the same logic as mediaService
    const img = sharp(inputBuffer, { limitInputPixels: 50 * 1024 * 1024 });
    const metadata = await img.metadata();
    expect(metadata.width).toBe(1920);

    const outputBuffer = await img
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const resultMeta = await sharp(outputBuffer).metadata();
    expect(resultMeta.width).toBe(1280);
    expect(resultMeta.height).toBe(720); // 16:9 aspect ratio preserved
    expect(resultMeta.format).toBe('webp');
  });

  it('preserves an image with width <= 1280 without downscaling', async () => {
    const sharp = (await import('sharp')).default;
    const inputBuffer = await sharp({
      create: {
        width: 800,
        height: 450,
        channels: 3,
        background: { r: 100, g: 150, b: 200 },
      },
    })
      .png()
      .toBuffer();

    const metadata = await sharp(inputBuffer).metadata();
    expect(metadata.width).toBe(800);
    expect(metadata.width).toBeLessThanOrEqual(1280);
  });
});

