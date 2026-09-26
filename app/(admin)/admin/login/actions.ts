'use server';

import { signIn } from '../../../../auth';
import { AuthError } from 'next-auth';
// Simple in-memory rate limiter (Technical Debt: replace with Redis in Day 9)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  if (now - record.timestamp > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return false;
  }
  record.count += 1;
  return true;
}

export async function loginAction(_prevState: unknown, formData: FormData) {
  // In a real app we'd get the IP from headers, but for this simple implementation
  // we'll just rate limit globally or by email. Let's do it by email.
  const email = formData.get('email') as string;
  if (email && !checkRateLimit(email)) {
    return { error: 'Too many login attempts. Please try again later.' };
  }

  try {
    await signIn('credentials', {
      email,
      password: formData.get('password'),
      redirectTo: '/admin',
    });
    return { error: null };
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && typeof (error as Record<string, unknown>).digest === 'string' && ((error as Record<string, unknown>).digest as string).startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials.' };
        default:
          return { error: 'Something went wrong.' };
      }
    }
    throw error;
  }
}
