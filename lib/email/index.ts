export interface SendEmailArgs {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export interface SendEmailResult {
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  error?: string;
}

export interface EmailTransport {
  send(args: SendEmailArgs): Promise<SendEmailResult>;
}

// Utility to strip CR/LF from headers to prevent header injection
function stripCRLF(val: string): string {
  return val.replace(/[\r\n]+/g, ' ').trim();
}

export class ConsoleTransport implements EmailTransport {
  constructor() {
    if (process.env.NODE_ENV === 'production') {
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
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || '';
  }

  async send(args: SendEmailArgs): Promise<SendEmailResult> {
    if (!this.apiKey || !this.fromEmail) {
      console.warn('WARNING: ResendTransport used without EMAIL_API_KEY or EMAIL_FROM. Email dropped.');
      return { status: 'FAILED', error: 'Missing Email Config' };
    }
    
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: stripCRLF(this.fromEmail),
          to: stripCRLF(args.to),
          subject: stripCRLF(args.subject),
          text: args.text,
          reply_to: args.replyTo ? stripCRLF(args.replyTo) : undefined
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        return { status: 'FAILED', error: `HTTP ${response.status} - ${errBody.slice(0, 100)}` };
      }

      return { status: 'SENT' };
    } catch (e) {
      return { status: 'FAILED', error: (e as Error).message };
    }
  }
}

export function getEmailTransport(): EmailTransport {
  if (process.env.NODE_ENV === 'production' || process.env.EMAIL_PROVIDER === 'resend') {
    return new ResendTransport();
  }
  return new ConsoleTransport();
}
