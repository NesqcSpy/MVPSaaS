'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  FileText,
  GitBranch,
  Activity,
  Plug,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/logo';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/pipelines', label: 'Pipelines', icon: GitBranch },
  { href: '/monitoring', label: 'Monitoring', icon: Activity },
  { href: '/integrations', label: 'Integrations', icon: Plug },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-bg-deep/40 sticky top-0 h-screen">
      <Link href="/dashboard" aria-label="DataClean dashboard" className="px-5 h-16 flex items-center border-b border-border">
        <Logo size={26} />
      </Link>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                active
                  ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30'
                  : 'text-ink-mid hover:text-ink-high hover:bg-surface/60 border border-transparent',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 text-xs text-ink-low">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-state-success animate-pulse-dot" />
          All systems operational
        </div>
        <div className="mt-2 text-ink-low">v0.1.0 · dev</div>
      </div>
    </aside>
  );
}
