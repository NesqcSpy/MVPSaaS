'use client';

import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-lg bg-bg-base/70 border-b border-border">
      <div className="flex items-center justify-between px-6 h-16">
        <div>
          <h1 className="text-lg font-semibold text-ink-high tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-ink-low">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-surface/40 text-sm text-ink-mid">
            <User className="h-4 w-4 text-ink-low" />
            {user?.name ?? user?.email ?? 'Operator'}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await logout();
              router.replace('/login');
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
