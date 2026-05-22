import Link from 'next/link';
import { Logo } from '@/components/brand/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden bg-bg-deep/60 border-r border-border">
        <div className="absolute inset-0 ring-grid opacity-50" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] bg-brand-primary/20 blur-3xl rounded-full" />
        <div className="relative p-12 flex flex-col justify-between">
          <Link href="/" aria-label="DataClean home"><Logo size={28} /></Link>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-grad max-w-md">
              Operational data automation that survives audit.
            </h2>
            <p className="mt-3 text-ink-mid max-w-md text-sm">
              JWT + refresh rotation, RBAC, audit logs, OpenTelemetry —
              built in from day one.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
