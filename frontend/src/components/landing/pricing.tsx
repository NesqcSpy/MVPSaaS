import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    sub: 'For pilots and individuals',
    cta: 'Start free',
    features: [
      '500 documents / month',
      '1 workspace',
      'CSV + Excel exports',
      'Community support',
    ],
  },
  {
    name: 'Growth',
    price: '$249',
    sub: 'For operations teams',
    highlight: true,
    cta: 'Start trial',
    features: [
      '25,000 documents / month',
      '5 workspaces',
      'All connectors (DB, HTTP, webhooks)',
      'UNION ALL transformations',
      'Audit logs · OpenTelemetry export',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    sub: 'SLA, SSO, custom deployments',
    cta: 'Talk to us',
    features: [
      'Unlimited documents',
      'Self-hosted or VPC deployment',
      'SSO / SAML / SCIM',
      'Dedicated support engineer',
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border bg-bg-deep/40">
      <div className="container py-24">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-grad max-w-2xl">
          Pricing that scales with throughput, not seats
        </h2>

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`card-surface p-6 flex flex-col ${
                p.highlight ? 'shadow-glow border-brand-primary/40' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink-high">{p.name}</h3>
                {p.highlight && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/30">
                    Most popular
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-grad">{p.price}</span>
                {p.price !== 'Custom' && <span className="text-ink-low text-sm">/ month</span>}
              </div>
              <p className="text-ink-low text-sm mt-1">{p.sub}</p>
              <ul className="mt-6 space-y-2 text-sm text-ink-mid flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-state-success mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={p.highlight ? 'primary' : 'secondary'}
                className="mt-6"
              >
                <Link href="/register">{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
