import { renderEmail } from '../layout';

export interface VerifyEmailProps {
  verifyUrl: string;
  /** Minutes until the token expires. */
  ttlMinutes: number;
}

export function verifyEmail({ verifyUrl, ttlMinutes }: VerifyEmailProps) {
  return {
    subject: 'Verify your DataClean email',
    html: renderEmail({
      preheader: `Click the button to confirm your email. Link expires in ${ttlMinutes} minutes.`,
      title: 'Confirm your email',
      intro:
        "Click the button below to verify the email address on your DataClean account. The link expires in " +
        ttlMinutes +
        " minutes; if it does, request a new one from the sign-in page.",
      ctaLabel: 'Verify email',
      ctaHref: verifyUrl,
      footnote:
        "You're seeing this because someone created an account using this address. If that wasn't you, ignore the email — no verification means no access.",
    }),
  };
}
