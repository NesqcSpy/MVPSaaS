import { MarketingShell } from '@/components/marketing/page-shell';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMeta({
  title: 'About',
  description:
    'DataClean was founded by operators who spent too many quarters watching analysts translate PDFs by hand. We build the platform we wish we had.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <MarketingShell
      eyebrow="About"
      title="We build the operational pipeline we wish we had."
      description="DataClean exists because we watched too many talented analysts spend their week translating documents into spreadsheets and ERPs. So we built infrastructure instead."
    >
      <h2>Why DataClean</h2>
      <p>
        In 2025 we kept meeting operations leaders with the same problem.
        Their teams were drowning in invoices, receipts, purchase orders,
        screenshots, and email attachments. The data was always there —
        it was just locked inside files that no system could read.
      </p>
      <p>
        Existing tools fell into two categories. <strong>Pure OCR APIs</strong>
        handed back raw text and walked away. <strong>Enterprise IDP suites</strong>{' '}
        took six months to roll out and started at $80,000 a year.
      </p>
      <p>
        There was no middle. So we built it.
      </p>

      <h2>What we believe</h2>
      <ul>
        <li>
          <strong>Operations is engineering.</strong> Ops workflows deserve
          the same rigor as production systems — observability, retries,
          idempotency, audit trails.
        </li>
        <li>
          <strong>Infrastructure should be inspectable.</strong> A pipeline
          you can't read is a pipeline you don't own. Every step of DataClean
          is open to the operator.
        </li>
        <li>
          <strong>The right tool is modular.</strong> Swap OCR providers
          without rewriting extraction. Add a connector without touching
          the workflow engine.
        </li>
        <li>
          <strong>Self-hostable matters.</strong> Some teams need to keep
          documents inside their VPC. We make that a deployment choice,
          not a sales blocker.
        </li>
      </ul>

      <h2>How we work</h2>
      <p>
        We are a small, senior team distributed across the Americas and
        Europe. We ship every week, talk to operators every day, and
        publish what we learn. If you've fought a document-data battle
        worth telling, we want to hear about it.
      </p>

      <h2>What's next</h2>
      <ul>
        <li>SOC 2 Type II</li>
        <li>Self-hosted Helm chart for Kubernetes</li>
        <li>SAP, NetSuite, and QuickBooks first-class connectors</li>
        <li>Open-source release of the OCR provider abstraction</li>
      </ul>

      <p>
        Reach us at <a href="mailto:hello@dataclean.io">hello@dataclean.io</a>.
      </p>
    </MarketingShell>
  );
}
