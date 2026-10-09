'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary relative z-10">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Admin Access</CardTitle>
            <CardDescription>Sign in to manage your portfolio</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          {state?.error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-6 font-medium text-center">
              {state.error}
            </div>
          )}
          <form action={formAction} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email Address
              </label>
              <Input id="email" name="email" type="email" required placeholder="admin@example.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={isPending} className="w-full mt-2">
              {isPending ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
