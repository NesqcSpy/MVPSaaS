/**
 * Public surface of the transactional email package. Each template
 * returns `{ subject, html }` — the email sender (SMTP / Resend /
 * Postmark) is responsible for delivery.
 */
export { renderEmail } from './layout';
export { welcomeEmail } from './templates/welcome';
export { verifyEmail } from './templates/verify-email';
export { passwordResetEmail } from './templates/password-reset';
export { documentFailedEmail } from './templates/document-failed';
export { weeklyDigestEmail } from './templates/weekly-digest';

export type RenderedEmail = { subject: string; html: string };
