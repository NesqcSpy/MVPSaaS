const QUOTES = [
  {
    quote:
      'We replaced 14 days of analyst backlog with a pipeline that runs continuously. Closing books used to slip by a week — now it doesn\'t.',
    name: 'Daniela Castro',
    role: 'Director of Finance Operations',
    company: 'Castelli Manufacturing',
  },
  {
    quote:
      'DataClean is what we would have built ourselves. Modular monolith, OpenTelemetry, audit log — we deployed it in a single afternoon and never looked back.',
    name: 'Mathieu Renaud',
    role: 'Staff Data Engineer',
    company: 'Norvex Logistics',
  },
  {
    quote:
      'We pushed 22,000 purchase orders through it the first month. The union-all view fed our warehouse directly. No glue code, no analyst hours.',
    name: 'Priya Subramanian',
    role: 'Head of Data Platform',
    company: 'NorthStar Freight',
  },
];

export function Testimonials() {
  return (
    <section className="border-b border-border">
      <div className="container py-24">
        <div className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-wide text-brand-primary mb-3">
            Operator-to-operator
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-grad">
            Teams that stopped translating PDFs by hand
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {QUOTES.map((q) => (
            <figure key={q.name} className="card-surface p-6 flex flex-col">
              <blockquote className="text-ink-mid text-[15px] leading-relaxed flex-1">
                <span className="text-brand-primary mr-1">“</span>
                {q.quote}
                <span className="text-brand-primary ml-1">”</span>
              </blockquote>
              <figcaption className="mt-5 pt-5 border-t border-border">
                <div className="text-ink-high text-sm font-medium">{q.name}</div>
                <div className="text-ink-low text-xs mt-0.5">
                  {q.role} · {q.company}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
