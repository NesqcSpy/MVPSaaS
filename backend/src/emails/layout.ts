/**
 * Shared HTML shell for transactional emails. We hand-roll HTML rather
 * than pull in a templating engine — the surface area is small, the
 * audience is technical, and inline styles survive every client.
 *
 * Design language follows the brand guide:
 *   - Single accent gradient (#3B82F6 → #06B6D4 → #8B5CF6).
 *   - Inter system stack with monospaced numerals where they appear.
 *   - One primary CTA per email; secondary links inline.
 *   - Light-mode default for inbox compatibility; dark accent panel.
 */

export interface EmailShellOptions {
  preheader: string;
  title: string;
  intro: string;
  /** Optional content block rendered between intro and CTA. */
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Optional secondary line (footnote, fallback URL, etc.). */
  footnote?: string;
}

const BRAND_GRADIENT =
  'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)';

export function renderEmail({
  preheader,
  title,
  intro,
  body = '',
  ctaLabel,
  ctaHref,
  footnote,
}: EmailShellOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escape(title)}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0F172A;">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">${escape(preheader)}</span>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F1F5F9;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;box-shadow:0 1px 2px rgba(15,23,42,0.04);">

          <!-- Logo header -->
          <tr>
            <td style="padding:28px 32px 24px;border-bottom:1px solid #F1F5F9;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:32px;">
                    <div style="width:32px;height:32px;border-radius:8px;background:${BRAND_GRADIENT};color:#F8FAFC;font-weight:700;font-size:20px;line-height:32px;text-align:center;font-family:Inter,sans-serif;">D</div>
                  </td>
                  <td style="padding-left:10px;font-size:16px;font-weight:600;letter-spacing:-0.01em;color:#0F172A;">DataClean</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.25;font-weight:600;letter-spacing:-0.02em;color:#0F172A;">${escape(title)}</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">${intro}</p>

              ${body}

              ${
                ctaLabel && ctaHref
                  ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;">
                <tr>
                  <td style="border-radius:10px;background:${BRAND_GRADIENT};">
                    <a href="${escape(ctaHref)}"
                       style="display:inline-block;padding:11px 22px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;font-family:Inter,sans-serif;">
                      ${escape(ctaLabel)}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;color:#64748B;">If the button doesn't work, paste this URL: <span style="color:#3B82F6;">${escape(ctaHref)}</span></p>
              `
                  : ''
              }

              ${footnote ? `<p style="margin:24px 0 0;font-size:12px;color:#64748B;line-height:1.5;">${footnote}</p>` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #F1F5F9;background:#F8FAFC;">
              <p style="margin:0;font-size:11px;line-height:1.5;color:#64748B;">
                DataClean — Operational Data Automation.<br>
                You're receiving this because you have a DataClean account. Update your <a href="https://dataclean.io/settings" style="color:#3B82F6;text-decoration:none;">notification preferences</a> any time.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escape(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
