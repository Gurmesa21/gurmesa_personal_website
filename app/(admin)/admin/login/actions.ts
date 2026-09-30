'use server';

import { signIn } from '../../../../auth';
import { AuthError } from 'next-auth';
import { loginRateLimiter } from '@/lib/rate-limit';

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  if (email) {
    const isAllowed = await loginRateLimiter.check(email);
    if (!isAllowed) {
      return { error: 'Too many login attempts. Please try again later.' };
    }
  }

  try {
    await signIn('credentials', {
      email,
      password: formData.get('password'),
      redirectTo: '/admin',
    });
    return { error: null };
  } catch (error) {
    console.error('LOGIN ERROR:', error);
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
