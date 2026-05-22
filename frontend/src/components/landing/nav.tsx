import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-bg-base/70 border-b border-border">
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/" aria-label="DataClean home">
          <Logo size={28} />
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm text-ink-mid">
          <a href="#features" className="hover:text-ink-high">Features</a>
          <a href="#how" className="hover:text-ink-high">How it works</a>
          <a href="#integrations" className="hover:text-ink-high">Integrations</a>
          <a href="#pricing" className="hover:text-ink-high">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm"><Link href="/login">Sign in</Link></Button>
          <Button asChild size="sm"><Link href="/register">Start free</Link></Button>
        </div>
      </nav>
    </header>
  );
}
