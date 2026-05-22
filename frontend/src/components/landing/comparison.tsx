import { Check, X, Minus } from 'lucide-react';

type Cell = 'yes' | 'no' | 'partial';

const ROWS: { label: string; values: Record<'dataclean' | 'ocrApi' | 'idp' | 'manual', Cell> }[] = [
  {
    label: 'Document ingestion + storage',
    values: { dataclean: 'yes', ocrApi: 'no', idp: 'yes', manual: 'no' },
  },
  {
    label: 'OCR provider abstraction',
    values: { dataclean: 'yes', ocrApi: 'no', idp: 'no', manual: 'no' },
  },
  {
    label: 'Template-driven extraction with confidence',
    values: { dataclean: 'yes', ocrApi: 'no', idp: 'yes', manual: 'no' },
  },
  {
    label: 'Cross-field business validation',
    values: { dataclean: 'yes', ocrApi: 'no', idp: 'partial', manual: 'partial' },
  },
  {
    label: 'ETL connectors (Postgres, CSV, Excel, HTTP)',
    values: { dataclean: 'yes', ocrApi: 'no', idp: 'partial', manual: 'no' },
  },
  {
    label: 'UNION ALL canonical schema across templates',
    values: { dataclean: 'yes', ocrApi: 'no', idp: 'no', manual: 'no' },
  },
  {
    label: 'OpenTelemetry + Prometheus by default',
    values: { dataclean: 'yes', ocrApi: 'no', idp: 'no', manual: 'no' },
  },
  {
    label: 'Self-hostable (Postgres + Redis)',
    values: { dataclean: 'yes', ocrApi: 'no', idp: 'partial', manual: 'no' },
  },
  {
    label: 'Deploy time',
    values: { dataclean: 'yes', ocrApi: 'yes', idp: 'no', manual: 'no' },
  },
  {
    label: 'Usage-based pricing (no seats)',
    values: { dataclean: 'yes', ocrApi: 'yes', idp: 'no', manual: 'no' },
  },
];

const ICON: Record<Cell, React.ReactNode> = {
  yes: <Check className="h-4 w-4 text-state-success" aria-label="yes" />,
  no: <X className="h-4 w-4 text-state-error/80" aria-label="no" />,
  partial: <Minus className="h-4 w-4 text-state-warning" aria-label="partial" />,
};

export function Comparison() {
  return (
    <section className="border-b border-border bg-bg-deep/40">
      <div className="container py-24">
        <div className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-wide text-brand-primary mb-3">
            How DataClean compares
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-grad">
            One pipeline, not five tools and a spreadsheet
          </h2>
          <p className="mt-4 text-ink-mid">
            DataClean is the platform you would have stitched together yourself —
            without the integration tax.
          </p>
        </div>

        <div className="card-surface p-0 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="border-b border-border text-ink-low text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-4 font-medium">Capability</th>
                  <th className="px-5 py-4 font-medium text-brand-primary">DataClean</th>
                  <th className="px-5 py-4 font-medium">Pure OCR APIs</th>
                  <th className="px-5 py-4 font-medium">Enterprise IDP suites</th>
                  <th className="px-5 py-4 font-medium">Manual entry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ROWS.map((r) => (
                  <tr key={r.label} className="hover:bg-surface/30">
                    <td className="px-5 py-3 text-ink-high">{r.label}</td>
                    <td className="px-5 py-3 text-center bg-brand-primary/5">{ICON[r.values.dataclean]}</td>
                    <td className="px-5 py-3 text-center">{ICON[r.values.ocrApi]}</td>
                    <td className="px-5 py-3 text-center">{ICON[r.values.idp]}</td>
                    <td className="px-5 py-3 text-center">{ICON[r.values.manual]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-ink-low">
          <span className="inline-flex items-center gap-1"><Check className="h-3 w-3 text-state-success" /> Built in</span>
          <span className="inline-flex items-center gap-1"><Minus className="h-3 w-3 text-state-warning" /> Partial / configurable</span>
          <span className="inline-flex items-center gap-1"><X className="h-3 w-3 text-state-error/80" /> Not supported</span>
        </div>
      </div>
    </section>
  );
}
