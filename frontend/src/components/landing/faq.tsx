'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { faqJsonLd } from '@/lib/seo';

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'What document types does DataClean handle?',
    a: 'Machine-printed PDFs and images (PNG, JPG, WEBP). Templates ship for invoices, receipts, and purchase orders. A generic template handles any other document, and the registry picks the best-scoring template when the kind is not explicit. Handwritten free-form documents are out of scope for v1.',
  },
  {
    q: 'Which OCR providers are supported?',
    a: 'Mistral OCR is the default. The provider abstraction lets you swap to AWS Textract, Google Vision, or Azure Document Intelligence by changing one environment variable — no code change. The active provider is recorded on every OCRResult, so downstream debugging is straightforward.',
  },
  {
    q: 'How does the UNION ALL transformation work?',
    a: 'Every template (invoice, receipt, PO, generic) gets mapped onto one canonical column set — reference, counterparty, date, total_amount, currency, and so on. Every output row carries _source_kind so the union can be split apart for analytics. The transformation also emits a real SQL "CREATE OR REPLACE VIEW … UNION ALL …" statement if you prefer to materialize it inside Postgres directly.',
  },
  {
    q: 'Can I self-host?',
    a: 'Yes. The stack is Postgres + Redis + two Node services + an optional Nginx. Everything ships in Docker Compose. Production deployments to Kubernetes, ECS, Railway, Render, or DigitalOcean App Platform are supported because the services are stateless behind the databases.',
  },
  {
    q: 'How does pricing scale?',
    a: 'Per document processed, not per seat. The free Starter plan caps at 500 documents/month. Growth is $249/mo for 25k. Scale is $799/mo for 150k. Enterprise unlocks self-host and VPC deployment with a custom SLA. Failed jobs are free.',
  },
  {
    q: 'What about security and audit?',
    a: 'JWT access tokens with short TTLs and sha256-hashed refresh tokens. Integration credentials are AES-256-GCM encrypted at rest with a per-record salt. Every state-changing action lands in the audit log. OpenTelemetry traces and Prometheus metrics ship from day one. SOC 2 Type II is on the roadmap.',
  },
  {
    q: 'How long does an integration take to set up?',
    a: 'A Postgres connector with credentials and table definition takes about three minutes through the UI. CSV and Excel exports require only the filename. HTTP webhooks need the URL and any auth headers. Test the connection from the Integrations page before saving.',
  },
  {
    q: 'Does extraction work for non-English documents?',
    a: 'Yes. Currency, date, and amount parsers handle European decimal-comma formats, Latin American date orderings (DD/MM/YYYY), and multiple currency codes by default. OCR provider quality determines text-level accuracy; Mistral OCR is multilingual.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-b border-border">
      <div className="container py-24">
        <div className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-wide text-brand-primary mb-3">FAQ</div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-grad">
            Questions operators ask first
          </h2>
        </div>

        <div className="max-w-3xl card-surface divide-y divide-border/60 p-0">
          {FAQ_ITEMS.map((item, i) => (
            <FAQRow key={item.q} item={item} defaultOpen={i === 0} />
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQ_ITEMS)) }}
        />
      </div>
    </section>
  );
}

function FAQRow({ item, defaultOpen }: { item: { q: string; a: string }; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  return (
    <div className="p-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span className="text-ink-high font-medium">{item.q}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-ink-low transition-transform shrink-0',
            open && 'rotate-180 text-brand-primary',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200',
          open ? 'grid-rows-[1fr] mt-3' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <p className="text-ink-mid text-sm leading-relaxed">{item.a}</p>
        </div>
      </div>
    </div>
  );
}
