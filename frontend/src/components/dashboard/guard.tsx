'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Client-side guard. Tries to bootstrap the session from a stored
 * refresh token; if that fails, redirects to /login. We keep this on
 * the client to avoid an extra network hop on every dashboard page.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, bootstrap } = useAuthStore();
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (status === 'idle' || status === 'loading') {
        await bootstrap();
      }
      if (!cancelled) setChecked(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (checked && status === 'unauthenticated') router.replace('/login');
  }, [checked, status, router]);

  if (!checked || status === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center text-ink-low text-sm">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse-dot" />
          Authenticating…
        </div>
      </div>
    );
  }
  if (status !== 'authenticated') return null;
  return <>{children}</>;
}
