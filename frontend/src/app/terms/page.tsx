import { MarketingShell } from '@/components/marketing/page-shell';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMeta({
  title: 'Terms of Service',
  description: 'The agreement between DataClean and the people who use the service.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <MarketingShell eyebrow="Legal" title="Terms of Service" description="Last updated 2026-05-21">
      <p>
        By creating an account or using the service you agree to these
        terms. The summary first; the legalese stays short.
      </p>

      <h2>1. The service</h2>
      <p>
        DataClean provides an operational data automation platform.
        Features and limits are described on the pricing page and in the
        product. We may add, change, or remove features; we will not
        materially degrade a paid plan without 30 days' notice.
      </p>

      <h2>2. Your account</h2>
      <p>
        You are responsible for keeping credentials secure and for
        actions taken under your account. Notify us promptly at{' '}
        <a href="mailto:security@dataclean.io">security@dataclean.io</a>
        if you suspect a compromise.
      </p>

      <h2>3. Acceptable use</h2>
      <ul>
        <li>Don't upload documents you don't have the right to process.</li>
        <li>Don't attempt to reverse-engineer, probe, or attack the service.</li>
        <li>Don't use the service to violate any law that applies to you.</li>
      </ul>

      <h2>4. Your data</h2>
      <p>
        You retain all rights to the documents and structured data
        produced from them. We process them only to provide the service,
        per the <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>5. Fees</h2>
      <p>
        Paid plans are billed in advance. Overages on metered usage are
        billed monthly in arrears. Refunds are issued for service
        outages exceeding the SLA; otherwise non-refundable.
      </p>

      <h2>6. Termination</h2>
      <p>
        You may terminate any time from the dashboard. We may terminate
        for non-payment after a 14-day cure period, or immediately for
        material breach of the acceptable-use clause.
      </p>

      <h2>7. Liability</h2>
      <p>
        To the extent permitted by law, DataClean's aggregate liability
        is capped at the fees paid in the 12 months preceding the
        incident. Indirect, consequential, and punitive damages are
        excluded.
      </p>

      <h2>8. Governing law</h2>
      <p>
        These terms are governed by the laws of the State of Delaware,
        United States. Disputes will be resolved in the courts of New
        Castle County.
      </p>

      <h2>9. Contact</h2>
      <p>
        For contract questions: <a href="mailto:legal@dataclean.io">legal@dataclean.io</a>.
      </p>
    </MarketingShell>
  );
}
