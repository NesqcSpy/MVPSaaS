import { MarketingShell } from '@/components/marketing/page-shell';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMeta({
  title: 'Security',
  description:
    'How DataClean handles authentication, encryption, audit, isolation, and incident response. Written for the security reviewer, not the marketing team.',
  path: '/security',
});

export default function SecurityPage() {
  return (
    <MarketingShell
      eyebrow="Security"
      title="Security is a deployment property, not a feature."
      description="A concise, technical account of how DataClean is built and operated. Written for security reviewers — long on specifics, short on slogans."
    >
      <h2>Identity & access</h2>
      <ul>
        <li>JWT access tokens with a 15-minute default TTL.</li>
        <li>Opaque refresh tokens, SHA-256 hashed at rest, rotated on every use, revoked on logout.</li>
        <li>RBAC at the workspace level with four roles: <code>OWNER</code>, <code>ADMIN</code>, <code>MEMBER</code>, <code>VIEWER</code>.</li>
        <li>Passwords hashed with bcrypt (work factor 12).</li>
        <li>Per-IP rate limiting via NestJS throttler; burst windows configurable.</li>
      </ul>

      <h2>Data at rest</h2>
      <ul>
        <li>PostgreSQL 16, encrypted at rest by the deployment platform's volume encryption.</li>
        <li>Integration credentials encrypted with AES-256-GCM. Key derivation via scrypt with a per-record salt.</li>
        <li>Stored documents are workspace-scoped at the storage layer; cross-tenant access is impossible by routing.</li>
        <li>Backups: daily snapshots, 30-day retention, encrypted off-site.</li>
      </ul>

      <h2>Data in transit</h2>
      <ul>
        <li>TLS 1.2+ everywhere. HSTS enabled on managed deployments.</li>
        <li>Helmet middleware applied; security headers reviewed quarterly.</li>
        <li>CORS allow-listed per environment; credential mode requires an explicit origin.</li>
      </ul>

      <h2>Tenant isolation</h2>
      <ul>
        <li>Every persisted row is keyed to a <code>workspaceId</code>. Every query path goes through a workspace-assertion helper.</li>
        <li>Job queues are routed to BullMQ queues by name; per-job payloads carry the workspace id and correlation id.</li>
        <li>Storage objects are prefixed with <code>workspaces/&lt;workspaceId&gt;/</code> and writes are validated against the requesting principal.</li>
      </ul>

      <h2>Observability & audit</h2>
      <ul>
        <li>OpenTelemetry traces from request through to BullMQ workers, with correlation IDs propagated across stages.</li>
        <li>Prometheus metrics for HTTP, jobs, OCR latency, and queue health, exposed on <code>/metrics</code>.</li>
        <li>Structured Pino logs with PII-redaction rules for authorization headers, cookies, and credential fields.</li>
        <li>Append-only audit log for every state-changing action (upload, integration write, pipeline run, …).</li>
      </ul>

      <h2>Incident response</h2>
      <ul>
        <li>On-call rotation, paged via PagerDuty.</li>
        <li>Customer notification within 72 hours of a confirmed incident affecting their data.</li>
        <li>Post-incident write-ups published publicly when impact extends beyond a single workspace.</li>
      </ul>

      <h2>Compliance & roadmap</h2>
      <ul>
        <li>SOC 2 Type II — in progress; audit window opens Q3 2026.</li>
        <li>GDPR — DataClean processes only customer-supplied data; DPA available on request.</li>
        <li>HIPAA — not yet supported.</li>
        <li>ISO 27001 — under evaluation for 2027.</li>
      </ul>

      <h2>Reporting a vulnerability</h2>
      <p>
        Email <a href="mailto:security@dataclean.io">security@dataclean.io</a>{' '}
        with a description, affected URL, and reproduction steps. We
        acknowledge within one business day and target a fix within 14
        days for confirmed high-severity issues.
      </p>
    </MarketingShell>
  );
}
