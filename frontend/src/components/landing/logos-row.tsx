/**
 * Wordmark row of "trusted by" customer logos. Renders as plain wordmarks
 * for now (no real customer permission); swap to real SVG logos as design
 * partners go public.
 */
const LOGOS = [
  { name: 'Norvex Logistics', style: 'tracking-widest' },
  { name: 'Castelli Manufacturing', style: 'italic' },
  { name: 'NorthStar Freight', style: 'tracking-tight font-light' },
  { name: 'Mero & Larson AP', style: 'tracking-wider' },
  { name: 'Halden Mobility', style: 'uppercase tracking-[0.2em] text-sm' },
  { name: 'Quintero Mfg', style: 'tracking-tight' },
];

export function LogosRow() {
  return (
    <section className="border-b border-border bg-bg-deep/30">
      <div className="container py-12">
        <div className="text-center text-xs uppercase tracking-wider text-ink-low mb-8">
          Trusted by operations teams shipping in production
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-6 gap-x-8 items-center text-ink-low">
          {LOGOS.map((l) => (
            <div
              key={l.name}
              className={`text-center font-semibold opacity-70 hover:opacity-100 transition ${l.style}`}
            >
              {l.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
