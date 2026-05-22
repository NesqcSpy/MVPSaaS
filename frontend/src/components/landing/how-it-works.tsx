export function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Upload',
      body: 'Drag documents into DataClean or POST them through the API. Multipart, streamed, mime-validated.',
    },
    {
      n: '02',
      title: 'OCR & extract',
      body: 'A worker pulls the document, runs OCR through the configured provider, and a template extracts canonical fields with per-field confidence.',
    },
    {
      n: '03',
      title: 'Validate',
      body: 'Required fields, type checks, business rules, duplicate detection. Issues are categorized error / warning / info.',
    },
    {
      n: '04',
      title: 'Route',
      body: 'Pipelines run UNION ALL transformations and write to your warehouse, CSV, Excel, or webhook. Idempotent, retried, observable.',
    },
  ];
  return (
    <section id="how" className="border-b border-border bg-bg-deep/40">
      <div className="container py-24">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-grad max-w-2xl">
          A single, observable pipeline — five steps
        </h2>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="relative card-surface p-6">
              <div className="text-brand-primary text-xs uppercase tracking-widest font-mono">{s.n}</div>
              <h3 className="mt-2 text-lg font-semibold text-ink-high">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-mid">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
