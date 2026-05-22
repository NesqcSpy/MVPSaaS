import { MarketingShell } from '@/components/marketing/page-shell';
import { Badge } from '@/components/ui/badge';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMeta({
  title: 'Changelog',
  description: 'What we shipped, in reverse chronological order. Substance only.',
  path: '/changelog',
});

interface Entry {
  date: string;
  version: string;
  tag: 'new' | 'improved' | 'fixed';
  title: string;
  body: string;
}

const ENTRIES: Entry[] = [
  {
    date: '2026-05-21',
    version: 'v0.1.0',
    tag: 'new',
    title: 'UNION ALL transformation',
    body:
      'Combines invoice, receipt, PO, and generic extractions into a single canonical schema. Every row tags _source_kind so the union can be split back apart for analytics. Also emits a real SQL CREATE OR REPLACE VIEW … UNION ALL … statement for warehouses that prefer to materialize the union directly.',
  },
  {
    date: '2026-05-18',
    version: 'v0.0.9',
    tag: 'new',
    title: 'Provider-abstracted OCR with Mistral default',
    body:
      'OCRProvider interface and OCRProviderFactory ship with Mistral, plus registered slots for AWS Textract, Google Vision, and Azure Document Intelligence. Swap providers via the OCR_PROVIDER environment variable — no code change.',
  },
  {
    date: '2026-05-14',
    version: 'v0.0.8',
    tag: 'new',
    title: 'Validation engine with severity rollup',
    body:
      'Required-field, type, format, business, and duplicate-detection rules. Issues categorize as error, warning, or info — and roll up to PASSED, PASSED_WITH_WARNINGS, or FAILED on the document.',
  },
  {
    date: '2026-05-09',
    version: 'v0.0.7',
    tag: 'improved',
    title: 'Postgres connector with ON CONFLICT upsert',
    body:
      'Transactional, batched inserts with optional ON CONFLICT … DO UPDATE upsert via the conflictKeys config option. Identifier quoting validated against a strict regex; no untrusted SQL.',
  },
  {
    date: '2026-05-05',
    version: 'v0.0.6',
    tag: 'new',
    title: 'OpenTelemetry + Prometheus from day one',
    body:
      'Traces propagate across request, queue, and worker boundaries. /metrics exposes HTTP, job, OCR latency, and queue depth series. No bolt-on instrumentation.',
  },
  {
    date: '2026-05-01',
    version: 'v0.0.5',
    tag: 'fixed',
    title: 'Refresh-token rotation race condition',
    body:
      'Eliminated a window where a parallel refresh could revoke a freshly issued token. Refresh is now serialized per-user; the in-flight promise is shared.',
  },
];

const TONE: Record<Entry['tag'], 'brand' | 'success' | 'warning'> = {
  new: 'brand',
  improved: 'success',
  fixed: 'warning',
};

export default function ChangelogPage() {
  return (
    <MarketingShell
      eyebrow="Changelog"
      title="What we shipped."
      description="Reverse-chronological. Substance only — no marketing one-liners."
    >
      <div className="not-prose mt-8 space-y-10">
        {ENTRIES.map((e) => (
          <article key={e.version} className="card-surface p-6">
            <div className="flex items-center gap-3 text-xs text-ink-low">
              <span className="font-mono">{e.date}</span>
              <span className="font-mono text-ink-mid">{e.version}</span>
              <Badge tone={TONE[e.tag]}>{e.tag}</Badge>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-ink-high">{e.title}</h3>
            <p className="mt-2 text-ink-mid text-[15px] leading-relaxed">{e.body}</p>
          </article>
        ))}
      </div>
    </MarketingShell>
  );
}
