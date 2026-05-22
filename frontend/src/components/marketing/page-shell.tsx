import { LandingNav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Shared shell for static marketing pages (About, Security, Pricing, …).
 * Keeps the nav + hero + footer chrome consistent without re-importing
 * the landing layout into every page.
 */
export function MarketingShell({ eyebrow, title, description, children }: Props) {
  return (
    <main className="min-h-screen">
      <LandingNav />

      <section className="border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 ring-grid opacity-50 pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[700px] bg-brand-primary/15 blur-3xl rounded-full pointer-events-none" />
        <div className="container relative py-20">
          {eyebrow && (
            <div className="text-xs uppercase tracking-wider text-brand-primary mb-4">
              {eyebrow}
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-grad max-w-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-ink-mid max-w-2xl text-lg">{description}</p>
          )}
        </div>
      </section>

      <section className="container py-16">
        <div className="prose prose-invert max-w-3xl prose-headings:text-ink-high prose-headings:font-semibold prose-p:text-ink-mid prose-strong:text-ink-high prose-a:text-brand-primary prose-li:text-ink-mid prose-code:text-brand-secondary">
          {children}
        </div>
      </section>

      <Footer />
    </main>
  );
}
