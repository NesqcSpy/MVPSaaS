'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth.store';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = React.useState({ email: '', password: '', name: '', organizationName: '' });
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(form.email, form.password, form.name || undefined, form.organizationName || undefined);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign up failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink-high">Create your account</h1>
      <p className="text-ink-low text-sm mt-1">Spin up a workspace and start automating in minutes.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" value={form.name} onChange={onChange('name')} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="organizationName">Organization</Label>
          <Input id="organizationName" value={form.organizationName} onChange={onChange('organizationName')} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" value={form.email} onChange={onChange('email')} required className="mt-1.5" autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={form.password} onChange={onChange('password')} required className="mt-1.5" autoComplete="new-password" minLength={8} />
          <p className="text-xs text-ink-low mt-1">Minimum 8 characters.</p>
        </div>
        {error && (
          <div className="text-sm text-state-error bg-state-error/10 border border-state-error/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-low text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
