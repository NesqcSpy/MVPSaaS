import { IntegrationKind } from '@prisma/client';

import {
  Connector,
  ConnectorConfig,
  ConnectorWriteResult,
  EtlBatch,
} from './connector.interface';

interface HttpOptions {
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  /** Headers merged with credential-injected auth. */
  headers?: Record<string, string>;
  /** "single" = one POST with the whole batch; "row" = one POST per row. */
  mode?: 'single' | 'row';
  /** Custom JSON envelope path, e.g. "data.rows". Empty = raw rows[]. */
  envelopePath?: string;
  /** Retry attempts on 5xx, default 2. */
  retries?: number;
  /** Per-request timeout (ms), default 30s. */
  timeoutMs?: number;
}

interface HttpCreds {
  /** Bearer token mode. */
  token?: string;
  /** Basic-auth mode. */
  basic?: { user: string; pass: string };
  /** Custom header injection (e.g. X-API-Key). */
  headers?: Record<string, string>;
}

/**
 * HTTP / webhook sink. Useful for pushing batches to ERPs / CRMs / Zapier.
 * Retries 5xx with exponential backoff; 4xx fails immediately.
 */
export class HttpConnector implements Connector {
  readonly kind: IntegrationKind;
  private readonly opts: HttpOptions;
  private readonly creds: HttpCreds | null;

  constructor(integration: ConnectorConfig) {
    this.opts = integration.config as unknown as HttpOptions;
    this.creds = (integration.credentials ?? null) as HttpCreds | null;
    this.kind = (this.opts as unknown as { kind?: IntegrationKind }).kind
      ?? IntegrationKind.HTTP_API;
    if (!this.opts?.url) throw new Error('HttpConnector: config.url is required');
  }

  async test(): Promise<void> {
    // Best-effort: HEAD if the endpoint accepts it, otherwise just resolve.
    try {
      const res = await fetch(this.opts.url, { method: 'HEAD', headers: this.buildHeaders() });
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
    } catch {
      // HEAD may be disallowed — that's fine; full write attempts will surface real issues.
    }
  }

  async write(batch: EtlBatch): Promise<ConnectorWriteResult> {
    const mode = this.opts.mode ?? 'single';
    let rowsWritten = 0;
    if (mode === 'row') {
      for (const row of batch.rows) {
        await this.send(this.envelope([row], batch));
        rowsWritten++;
      }
    } else {
      await this.send(this.envelope(batch.rows, batch));
      rowsWritten = batch.rows.length;
    }
    return { rowsWritten, destination: this.opts.url, meta: { mode } };
  }

  private envelope(rows: unknown[], batch: EtlBatch): unknown {
    const payload = { rows, columns: batch.columns, destination: batch.destination };
    const p = this.opts.envelopePath;
    if (!p) return rows;
    const obj: Record<string, unknown> = {};
    const segments = p.split('.');
    let cursor: Record<string, unknown> = obj;
    segments.forEach((seg, i) => {
      if (i === segments.length - 1) cursor[seg] = payload;
      else cursor = (cursor[seg] = {}) as Record<string, unknown>;
    });
    return obj;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.opts.headers ?? {}),
      ...(this.creds?.headers ?? {}),
    };
    if (this.creds?.token) headers.Authorization = `Bearer ${this.creds.token}`;
    if (this.creds?.basic) {
      const b64 = Buffer.from(`${this.creds.basic.user}:${this.creds.basic.pass}`).toString('base64');
      headers.Authorization = `Basic ${b64}`;
    }
    return headers;
  }

  private async send(body: unknown): Promise<void> {
    const max = this.opts.retries ?? 2;
    const timeoutMs = this.opts.timeoutMs ?? 30_000;

    for (let attempt = 0; attempt <= max; attempt++) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(this.opts.url, {
          method: this.opts.method ?? 'POST',
          headers: this.buildHeaders(),
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (res.ok) return;
        const text = await res.text().catch(() => res.statusText);
        if (res.status < 500 || attempt === max) {
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
        }
      } finally {
        clearTimeout(t);
      }
      // exponential backoff before retry
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
}
