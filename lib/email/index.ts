
export interface SendEmailArgs {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  idempotencyKey?: string;
}

export interface SendEmailResult {
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  error?: string;
  id?: string;
}

export interface EmailTransport {
  send(args: SendEmailArgs): Promise<SendEmailResult>;
}

// Utility to strip CR/LF from headers to prevent header injection
export function stripCRLF(val: string): string {
  return val.replace(/[\r\n]+/g, ' ').trim();
}

export class ConsoleTransport implements EmailTransport {
  constructor() {
    if (process.env.APP_ENV === 'production') {
      throw new Error('ConsoleTransport cannot be used in production.');
    }
  }

  async send(args: SendEmailArgs): Promise<SendEmailResult> {
    console.log('--- EMAIL SKIPPED (CONSOLE TRANSPORT) ---');
    console.log(`To: ${stripCRLF(args.to)}`);
    console.log(`Subject: ${stripCRLF(args.subject)}`);
    if (args.replyTo) {
      console.log(`Reply-To: ${stripCRLF(args.replyTo)}`);
    }
    console.log('Body:');
    console.log(args.text);
    console.log('-----------------------------------------');
    
    return { status: 'SKIPPED' };
  }
}

export class ResendTransport implements EmailTransport {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || '';
  }

  private async executeSend(payload: any, idempotencyKey?: string): Promise<{ ok: boolean; status: number; text: string }> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) {
      headers['Idempotency-Key'] = stripCRLF(idempotencyKey);
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    const text = await response.text();
    return { ok: response.ok, status: response.status, text };
  }

  async send(args: SendEmailArgs): Promise<SendEmailResult> {
    if (!this.apiKey || !this.fromEmail) {
      console.warn('WARNING: ResendTransport used without EMAIL_API_KEY / RESEND_API_KEY or EMAIL_FROM. Email dropped.');
      return { status: 'FAILED', error: 'Missing Email Config' };
    }

    const payload: any = {
      from: stripCRLF(this.fromEmail),
      to: stripCRLF(args.to),
      subject: stripCRLF(args.subject),
      text: args.text,
    };
    if (args.html) payload.html = args.html;
    if (args.replyTo) payload.reply_to = stripCRLF(args.replyTo);

    try {
      let result = await this.executeSend(payload, args.idempotencyKey);

      // Retry once on transient failures (HTTP 429, 5xx)
      if (!result.ok && (result.status === 429 || result.status >= 500)) {
        await new Promise(r => setTimeout(r, 500));
        result = await this.executeSend(payload, args.idempotencyKey);
      }

      if (!result.ok) {
        return { status: 'FAILED', error: `HTTP ${result.status} - ${result.text.slice(0, 100)}` };
      }

      try {
        const data = JSON.parse(result.text);
        return { status: 'SENT', id: data?.id };
      } catch {
        return { status: 'SENT' };
      }
    } catch (e: any) {
      // Retry once on network / timeout errors
      try {
        await new Promise(r => setTimeout(r, 500));
        const retryResult = await this.executeSend(payload, args.idempotencyKey);
        if (retryResult.ok) {
          return { status: 'SENT' };
        }
        return { status: 'FAILED', error: `HTTP ${retryResult.status} - ${retryResult.text.slice(0, 100)}` };
      } catch (retryError: any) {
        return { status: 'FAILED', error: (retryError?.message || e?.message || 'Network error').substring(0, 255) };
      }
    }
  }
}

export function getEmailTransport(): EmailTransport {
  if (process.env.APP_ENV === 'production' || process.env.EMAIL_PROVIDER === 'resend') {
    return new ResendTransport();
  }
  return new ConsoleTransport();
}
