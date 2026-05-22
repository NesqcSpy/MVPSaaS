import { MarketingShell } from '@/components/marketing/page-shell';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMeta({
  title: 'Privacy Policy',
  description: 'How DataClean collects, processes, retains, and protects personal data.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <MarketingShell eyebrow="Legal" title="Privacy Policy" description="Last updated 2026-05-21">
      <p>
        DataClean ("we", "us") provides operational data automation
        software. This policy explains what we collect, how we use it,
        and the rights you have. The plain-English summary first;
        statutory detail follows.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — name, email, organization, IP
          address, user agent, last login timestamp.
        </li>
        <li>
          <strong>Workspace content</strong> — documents you upload, the
          structured data extracted from them, integrations you configure.
        </li>
        <li>
          <strong>Operational telemetry</strong> — request logs, queue
          activity, error traces — used for debugging and service health.
          Logs are PII-redacted by default.
        </li>
        <li>
          <strong>Billing data</strong> — handled by Stripe; we never see
          your card details.
        </li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To run the service you subscribed to.</li>
        <li>To investigate incidents and fix bugs.</li>
        <li>To send transactional emails (login, security, billing).</li>
        <li>
          To send product updates if you opted in — unsubscribe with one
          click; no dark patterns.
        </li>
      </ul>

      <h2>3. How we don't use it</h2>
      <ul>
        <li>We do not sell data.</li>
        <li>We do not train AI models on customer documents.</li>
        <li>We do not allow third-party advertising trackers on app surfaces.</li>
      </ul>

      <h2>4. Retention</h2>
      <p>
        Documents and extractions live as long as the parent workspace.
        Deleting an account triggers a 30-day soft-delete window; after
        that, data is purged from primary storage and rotated out of
        backups within a further 90 days.
      </p>

      <h2>5. Sub-processors</h2>
      <p>
        We engage a short, named list of sub-processors (cloud hosting,
        email delivery, OCR providers when you select them). The current
        list is available on request at{' '}
        <a href="mailto:privacy@dataclean.io">privacy@dataclean.io</a>.
      </p>

      <h2>6. Your rights</h2>
      <ul>
        <li>Access — export every record we hold about you.</li>
        <li>Rectification — correct anything we hold that's wrong.</li>
        <li>Erasure — delete your account and associated data.</li>
        <li>Objection — opt out of non-essential processing.</li>
      </ul>

      <h2>7. Contact</h2>
      <p>
        Privacy inquiries: <a href="mailto:privacy@dataclean.io">privacy@dataclean.io</a>.
        Security incidents: <a href="mailto:security@dataclean.io">security@dataclean.io</a>.
      </p>
    </MarketingShell>
  );
}
