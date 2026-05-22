import { MarketingShell } from '@/components/marketing/page-shell';
import { Pricing } from '@/components/landing/pricing';
import { FAQ } from '@/components/landing/faq';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMeta({
  title: 'Pricing',
  description:
    'Usage-based pricing on documents processed, not seats. Starter is free. Growth at $249/mo. Scale at $799/mo. Enterprise unlocks self-host and VPC.',
  path: '/pricing',
});

export default function PricingPage() {
  return (
    <MarketingShell
      eyebrow="Pricing"
      title="Priced on documents processed — not seats."
      description="Failed jobs are free. There are no per-user fees. Every plan includes all connectors, all templates, and the full pipeline."
    >
      <p className="text-ink-mid">
        We charge for throughput because throughput is the value. Add as
        many operators as you want — the meter only runs on successful
        document processing.
      </p>
      <p className="text-ink-mid">
        Annual contracts get two months free. Pre-paid volume blocks above
        the Scale plan are available — email us.
      </p>
      <div className="not-prose mt-12">
        <Pricing />
      </div>
      <div className="not-prose">
        <FAQ />
      </div>
    </MarketingShell>
  );
}
