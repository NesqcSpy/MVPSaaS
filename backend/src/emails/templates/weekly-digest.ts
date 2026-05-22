import { renderEmail } from '../layout';

export interface WeeklyDigestProps {
  workspaceName: string;
  weekOf: string; // ISO date
  documentsProcessed: number;
  exportsCompleted: number;
  failuresCount: number;
  avgExtractionScore: number;
  topTemplate: { name: string; count: number };
  dashboardUrl: string;
}

export function weeklyDigestEmail(p: WeeklyDigestProps) {
  const tone =
    p.failuresCount === 0 ? '#10B981' : p.failuresCount < 5 ? '#F59E0B' : '#EF4444';

  return {
    subject: `[DataClean] Weekly digest — ${p.workspaceName} · ${p.documentsProcessed.toLocaleString()} docs`,
    html: renderEmail({
      preheader: `Last 7 days: ${p.documentsProcessed.toLocaleString()} docs, ${p.exportsCompleted.toLocaleString()} exports, ${p.failuresCount} failures.`,
      title: `Weekly digest — ${escape(p.workspaceName)}`,
      intro: `Operational summary for the week of ${escape(p.weekOf)}.`,
      body: `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:18px 0;border-collapse:separate;border-spacing:8px;">
          <tr>
            ${cell('Documents processed', p.documentsProcessed.toLocaleString())}
            ${cell('Exports completed', p.exportsCompleted.toLocaleString())}
          </tr>
          <tr>
            ${cell('Failures', String(p.failuresCount), tone)}
            ${cell('Avg extraction score', p.avgExtractionScore.toFixed(2))}
          </tr>
        </table>

        <div style="margin:12px 0 4px;font-size:13px;color:#475569;">
          Top template: <strong style="color:#0F172A;">${escape(p.topTemplate.name)}</strong>
          <span style="color:#64748B;"> (${p.topTemplate.count.toLocaleString()} docs)</span>
        </div>
      `,
      ctaLabel: 'View full dashboard',
      ctaHref: p.dashboardUrl,
      footnote:
        'Want this digest less often or off entirely? Adjust notifications in your workspace settings.',
    }),
  };
}

function cell(label: string, value: string, valueColor = '#0F172A'): string {
  return `
    <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;vertical-align:top;width:50%;">
      <div style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.04em;">${escape(label)}</div>
      <div style="margin-top:4px;font-size:22px;font-weight:600;color:${valueColor};font-variant-numeric:tabular-nums;font-family:Inter,sans-serif;">${escape(value)}</div>
    </td>
  `;
}

function escape(s: string): string {
  return String(s).replace(/[<>&"']/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}
