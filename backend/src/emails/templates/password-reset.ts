import { renderEmail } from '../layout';

export interface PasswordResetProps {
  resetUrl: string;
  ttlMinutes: number;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function passwordResetEmail({ resetUrl, ttlMinutes, ipAddress, userAgent }: PasswordResetProps) {
  const meta =
    ipAddress || userAgent
      ? `<div style="margin:16px 0;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;font-size:12px;color:#64748B;line-height:1.55;">
           <strong style="color:#0F172A;">Request details</strong><br>
           ${ipAddress ? `IP address: <span style="font-family:JetBrains Mono,Menlo,monospace;color:#334155;">${escape(ipAddress)}</span><br>` : ''}
           ${userAgent ? `Device: ${escape(userAgent)}` : ''}
         </div>`
      : '';

  return {
    subject: 'Reset your DataClean password',
    html: renderEmail({
      preheader: `Reset link valid for ${ttlMinutes} minutes.`,
      title: 'Reset your password',
      intro:
        "Someone requested a password reset for your DataClean account. Click below to set a new one. The link is valid for " +
        ttlMinutes +
        " minutes.",
      body: meta,
      ctaLabel: 'Reset password',
      ctaHref: resetUrl,
      footnote:
        "If you didn't ask for a reset, ignore this email — your current password stays active. Concerned? Reach out to security@dataclean.io.",
    }),
  };
}

function escape(s: string): string {
  return String(s).replace(/[<>&"']/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}
