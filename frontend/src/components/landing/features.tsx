import {
  FileText,
  Cpu,
  ShieldCheck,
  Workflow,
  Activity,
  GitBranch,
} from 'lucide-react';

const FEATURES = [
  {
    icon: FileText,
    title: 'Document ingestion',
    body: 'Drag-and-drop PDFs, scans, photos. Streamed uploads, deduped storage, mime-type validation, per-tenant isolation.',
  },
  {
    icon: Cpu,
    title: 'Provider-abstracted OCR',
    body: 'Mistral by default. Textract, Vision, Azure via the same interface. Swap providers with one env var — no code change.',
  },
  {
    icon: Workflow,
    title: 'Template extraction',
    body: 'Invoice, receipt, PO, generic. Per-field confidence scoring. Best-template fallback when the kind is unknown.',
  },
  {
    icon: ShieldCheck,
    title: 'Validation engine',
    body: 'Required fields, type checks, cross-field business rules, duplicate detection scoped to workspace. Severity-driven rollup.',
  },
  {
    icon: GitBranch,
    title: 'ETL & UNION ALL',
    body: 'Postgres, MySQL, MSSQL, CSV, Excel, HTTP. Built-in UNION ALL transformation merges every template into one canonical schema.',
  },
  {
    icon: Activity,
    title: 'Operational telemetry',
    body: 'OpenTelemetry, Prometheus, structured Pino logs, queue health, per-job audit. Wired in from day one — not bolted on.',
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border">
      <div className="container py-24">
        <div className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-wide text-brand-primary mb-3">
            Operational, not magical
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-grad">
            Every layer engineered for production
          </h2>
          <p className="mt-4 text-ink-mid">
            DataClean is the platform you would build yourself if you had a year of runway —
            modular, observable, and boringly reliable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card-surface p-6 hover:border-border-strong transition"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-primary/10 border border-brand-primary/30 grid place-items-center text-brand-primary mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-ink-high">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-mid leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
