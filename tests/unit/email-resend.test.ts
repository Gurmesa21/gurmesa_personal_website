/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResendTransport, ConsoleTransport, getEmailTransport, stripCRLF } from '@/lib/email';

describe('Resend Email Transport Hardening (B2)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('Configuration & Initialization', () => {
    it('returns FAILED when EMAIL_API_KEY and RESEND_API_KEY are absent', async () => {
      vi.stubEnv('EMAIL_API_KEY', '');
      vi.stubEnv('RESEND_API_KEY', '');
      vi.stubEnv('EMAIL_FROM', 'contact@avenor.info');

      const transport = new ResendTransport();
      const res = await transport.send({
        to: 'owner@example.com',
        subject: 'Test Subject',
        text: 'Test Body'
      });

      expect(res.status).toBe('FAILED');
      expect(res.error).toContain('Missing Email Config');
    });

    it('returns FAILED when EMAIL_FROM is absent', async () => {
      vi.stubEnv('EMAIL_API_KEY', 're_test_key_123');
      vi.stubEnv('EMAIL_FROM', '');

      const transport = new ResendTransport();
      const res = await transport.send({
        to: 'owner@example.com',
        subject: 'Test Subject',
        text: 'Test Body'
      });

      expect(res.status).toBe('FAILED');
      expect(res.error).toContain('Missing Email Config');
    });

    it('accepts RESEND_API_KEY as an alternative to EMAIL_API_KEY', async () => {
      vi.stubEnv('EMAIL_API_KEY', '');
      vi.stubEnv('RESEND_API_KEY', 're_alternate_key_456');
      vi.stubEnv('EMAIL_FROM', 'contact@avenor.info');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ id: 'msg_123' })
      } as any);

      const transport = new ResendTransport();
      const res = await transport.send({
        to: 'owner@example.com',
        subject: 'Test Subject',
        text: 'Test Body'
      });

      expect(res.status).toBe('SENT');
      expect(res.id).toBe('msg_123');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer re_alternate_key_456'
          })
        })
      );
    });

    it('getEmailTransport returns ResendTransport in production', () => {
      vi.stubEnv('APP_ENV', 'production');
      const transport = getEmailTransport();
      expect(transport).toBeInstanceOf(ResendTransport);
    });

    it('ConsoleTransport throws in production', () => {
      vi.stubEnv('APP_ENV', 'production');
      expect(() => new ConsoleTransport()).toThrow(/ConsoleTransport cannot be used in production/);
    });
  });

  describe('Header Injection & Formatting', () => {
    it('stripCRLF strips carriage returns and newlines from strings', () => {
      expect(stripCRLF('Hello\r\nWorld')).toBe('Hello World');
      expect(stripCRLF('test@domain.com\r\nBcc: spy@domain.com')).toBe('test@domain.com Bcc: spy@domain.com');
    });

    it('strips CRLF from to, subject, and replyTo in outgoing payload', async () => {
      vi.stubEnv('EMAIL_API_KEY', 're_test_key_123');
      vi.stubEnv('EMAIL_FROM', 'contact@avenor.info');

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ id: 'msg_crlf' })
      });
      globalThis.fetch = mockFetch;

      const transport = new ResendTransport();
      await transport.send({
        to: 'victim@example.com\r\nBcc: evil@example.com',
        subject: 'Normal Subject\r\nInjected-Header: 1',
        text: 'Clean body',
        replyTo: 'reply@example.com\r\n'
      });

      const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(calledBody.to).toBe('victim@example.com Bcc: evil@example.com');
      expect(calledBody.subject).toBe('Normal Subject Injected-Header: 1');
      expect(calledBody.reply_to).toBe('reply@example.com');
    });
  });

  describe('Idempotency & Transient Retries', () => {
    it('passes Idempotency-Key header when provided', async () => {
      vi.stubEnv('EMAIL_API_KEY', 're_test_key_123');
      vi.stubEnv('EMAIL_FROM', 'contact@avenor.info');

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ id: 'msg_idemp' })
      });
      globalThis.fetch = mockFetch;

      const transport = new ResendTransport();
      await transport.send({
        to: 'owner@example.com',
        subject: 'Idempotency Test',
        text: 'Body',
        idempotencyKey: 'idemp_key_unique_999'
      });

      expect(mockFetch.mock.calls[0][1].headers['Idempotency-Key']).toBe('idemp_key_unique_999');
    });

    it('retries once on HTTP 429 rate limit and succeeds on retry', async () => {
      vi.stubEnv('EMAIL_API_KEY', 're_test_key_123');
      vi.stubEnv('EMAIL_FROM', 'contact@avenor.info');

      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: async () => 'Rate limit exceeded'
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ id: 'msg_retry_success' })
        });
      globalThis.fetch = mockFetch;

      const transport = new ResendTransport();
      const res = await transport.send({
        to: 'owner@example.com',
        subject: 'Retry Test',
        text: 'Body'
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(res.status).toBe('SENT');
      expect(res.id).toBe('msg_retry_success');
    });

    it('retries once on HTTP 500 and returns FAILED if second attempt also fails', async () => {
      vi.stubEnv('EMAIL_API_KEY', 're_test_key_123');
      vi.stubEnv('EMAIL_FROM', 'contact@avenor.info');

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });
      globalThis.fetch = mockFetch;

      const transport = new ResendTransport();
      const res = await transport.send({
        to: 'owner@example.com',
        subject: 'Server Error Test',
        text: 'Body'
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(res.status).toBe('FAILED');
      expect(res.error).toContain('HTTP 500');
    });

    it('retries once on network failure and handles persistent network failure gracefully', async () => {
      vi.stubEnv('EMAIL_API_KEY', 're_test_key_123');
      vi.stubEnv('EMAIL_FROM', 'contact@avenor.info');

      const mockFetch = vi.fn().mockRejectedValue(new Error('Fetch failed: connection timeout'));
      globalThis.fetch = mockFetch;

      const transport = new ResendTransport();
      const res = await transport.send({
        to: 'owner@example.com',
        subject: 'Network Timeout Test',
        text: 'Body'
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(res.status).toBe('FAILED');
      expect(res.error).toContain('connection timeout');
    });
  });
});
