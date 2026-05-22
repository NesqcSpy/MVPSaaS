export function Integrations() {
  const groups = [
    {
      title: 'Databases',
      items: ['PostgreSQL', 'MySQL', 'SQL Server', 'Snowflake', 'BigQuery'],
    },
    {
      title: 'Files & exports',
      items: ['CSV', 'Excel', 'Parquet', 'S3', 'GCS'],
    },
    {
      title: 'APIs & webhooks',
      items: ['HTTP', 'Zapier', 'Slack', 'n8n', 'Custom'],
    },
    {
      title: 'OCR providers',
      items: ['Mistral OCR', 'AWS Textract', 'Google Vision', 'Azure DI'],
    },
  ];
  return (
    <section id="integrations" className="border-b border-border">
      <div className="container py-24">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-grad max-w-2xl">
          Plugs into the systems you already operate
        </h2>
        <p className="mt-3 text-ink-mid max-w-2xl">
          Connector and provider abstractions are first-class. Add a new
          integration without touching the core engine.
        </p>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((g) => (
            <div key={g.title} className="card-surface p-6">
              <div className="text-xs uppercase tracking-wide text-brand-primary mb-3">{g.title}</div>
              <ul className="space-y-2 text-ink-mid text-sm">
                {g.items.map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/70" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
