'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null });

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'sans-serif' }}>
      <h1>Admin Login</h1>
      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="email">Email</label>
          <br />
          <input id="email" name="email" type="email" required style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <br />
          <input id="password" name="password" type="password" required style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <button type="submit" disabled={isPending} style={{ padding: '0.5rem' }}>
          {isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
