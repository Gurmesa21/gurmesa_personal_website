import { describe, it, expect } from 'vitest';
import { publicContactEmailSchema } from '@/lib/validation/settings';

describe('Site Settings - publicContactEmail validation', () => {
  it('accepts a standard valid email', () => {
    const input = 'contact@gurmesa.dev';
    const result = publicContactEmailSchema.parse(input);
    expect(result).toBe('contact@gurmesa.dev');
  });

  it('trims leading and trailing whitespace from valid email', () => {
    const input = '   admin@example.com   ';
    const result = publicContactEmailSchema.parse(input);
    expect(result).toBe('admin@example.com');
  });

  it('accepts an email with exactly 254 characters (RFC 5321 limit)', () => {
    // 254 characters: 64 char local + @ + 189 char domain
    const localPart = 'a'.repeat(64);
    // Domain parts: 60 + . + 60 + . + 63 + .com = 189 chars
    const domainPart = `${'b'.repeat(60)}.${'c'.repeat(60)}.${'d'.repeat(63)}.com`;
    const email254 = `${localPart}@${domainPart}`;
    expect(email254.length).toBe(254);

    const result = publicContactEmailSchema.parse(email254);
    expect(result).toBe(email254);
  });

  it('rejects an email exceeding 254 characters', () => {
    const localPart = 'a'.repeat(65);
    const domainPart = `${'b'.repeat(60)}.${'c'.repeat(60)}.${'d'.repeat(63)}.com`;
    const email255 = `${localPart}@${domainPart}`;
    expect(email255.length).toBe(255);

    expect(() => publicContactEmailSchema.parse(email255)).toThrow();
  });

  it('rejects invalid email formats', () => {
    const invalidEmails = [
      'not-an-email',
      'user@',
      '@domain.com',
      'user@domain',
      'user space@domain.com',
      'javascript:alert(1)',
      ''
    ];

    for (const email of invalidEmails) {
      expect(() => publicContactEmailSchema.parse(email)).toThrow();
    }
  });

  it('rejects non-string values', () => {
    expect(() => publicContactEmailSchema.parse(null)).toThrow();
    expect(() => publicContactEmailSchema.parse(undefined)).toThrow();
    expect(() => publicContactEmailSchema.parse(12345)).toThrow();
  });
});
