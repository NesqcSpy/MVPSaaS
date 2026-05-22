import { renderEmail } from '../layout';

export interface WelcomeProps {
  name?: string | null;
  dashboardUrl: string;
}

export function welcomeEmail({ name, dashboardUrl }: WelcomeProps) {
  const greeting = name ? `Welcome to DataClean, ${escape(name)}.` : 'Welcome to DataClean.';
  return {
    subject: 'Welcome to DataClean',
    html: renderEmail({
      preheader: 'Your workspace is live. Upload a document to run the pipeline end-to-end.',
      title: greeting,
      intro:
        "Your workspace is ready. The fastest way to see DataClean is to upload one document — the pipeline will OCR, extract, validate, and surface the structured result in your dashboard.",
      body: `
        <div style="margin:20px 0;border:1px solid #E2E8F0;border-radius:10px;padding:16px;background:#F8FAFC;">
          <p style="margin:0 0 8px;font-size:13px;color:#475569;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Three things to try first</p>
          <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.65;color:#334155;">
            <li>Upload a sample invoice or receipt.</li>
            <li>Watch the pipeline run on the dashboard.</li>
            <li>Connect an integration to start routing data.</li>
          </ol>
        </div>
      `,
      ctaLabel: 'Open the dashboard',
      ctaHref: dashboardUrl,
      footnote:
        "Need a walkthrough? Reply to this email and a real engineer on our team will get back to you within one business day.",
    }),
  };
}

function escape(s: string): string {
  return String(s).replace(/[<>&"']/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}
