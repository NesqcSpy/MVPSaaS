import Link from 'next/link';
import { Logo } from '@/components/brand/logo';

type FooterItem = { label: string; href: string };

const COLS: { title: string; items: FooterItem[] }[] = [
  {
    title: 'Product',
    items: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Integrations', href: '/#integrations' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Developers',
    items: [
      { label: 'API docs', href: '/docs' },
      { label: 'OpenTelemetry', href: '/security#observability--audit' },
      { label: 'Status', href: 'https://status.dataclean.io' },
      { label: 'GitHub', href: 'https://github.com/dataclean' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Security', href: '/security' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="mb-3"><Logo size={22} /></div>
          <p className="text-ink-low text-xs leading-relaxed max-w-xs">
            Operational data automation platform.
            From documents to structured operations.
          </p>
          <div className="mt-4 flex gap-3 text-ink-low">
            <a href="https://x.com/dataclean" aria-label="X" className="hover:text-ink-high">𝕏</a>
            <a href="https://www.linkedin.com/company/dataclean" aria-label="LinkedIn" className="hover:text-ink-high">in</a>
            <a href="https://github.com/dataclean" aria-label="GitHub" className="hover:text-ink-high">gh</a>
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <div className="text-ink-low text-xs uppercase tracking-wide mb-3">{col.title}</div>
            <ul className="space-y-2 text-ink-mid">
              {col.items.map((i) => (
                <li key={i.label}>
                  <Link href={i.href} className="hover:text-ink-high">{i.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container py-4 text-xs text-ink-low flex items-center justify-between">
          <span>© {new Date().getFullYear()} DataClean. All rights reserved.</span>
          <span>Built for operations teams who hate manual data entry.</span>
        </div>
      </div>
    </footer>
  );
}
