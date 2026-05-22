'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Topbar } from '@/components/dashboard/topbar';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { JobStatusPill, type JobStatus } from '@/components/dashboard/status-pill';
import { formatDate, formatRelative } from '@/lib/utils';

interface Failure {
  id: string;
  type: string;
  status: JobStatus;
  attempts: number;
  error: string | null;
  documentId: string | null;
  pipelineId: string | null;
  updatedAt: string;
}

interface ThroughputBucket {
  bucket: string;
  count: number;
  status: JobStatus;
}

export default function MonitoringPage() {
  const failures = useQuery({
    queryKey: ['monitoring', 'failures'],
    queryFn: () => api.get<Failure[]>('/monitoring/failures'),
    refetchInterval: 15_000,
  });
  const throughput = useQuery({
    queryKey: ['monitoring', 'throughput', 24],
    queryFn: () => api.get<ThroughputBucket[]>('/monitoring/throughput?hours=24'),
    refetchInterval: 30_000,
  });

  return (
    <div>
      <Topbar title="Monitoring" subtitle="Job throughput, recent failures, and queue diagnostics" />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Job throughput · 24h</CardTitle>
              <CardDescription>Per-hour bucket, grouped by job status</CardDescription>
            </div>
          </CardHeader>
          <Throughput data={throughput.data ?? []} />
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-ink-high">Recent failures</div>
                <div className="text-sm text-ink-low">Latest failed and dead-letter jobs</div>
              </div>
            </div>
          </div>
          <Table>
            <THead>
              <TR>
                <TH>Type</TH>
                <TH>Status</TH>
                <TH>Attempts</TH>
                <TH>Error</TH>
                <TH>When</TH>
              </TR>
            </THead>
            <TBody>
              {(failures.data ?? []).map((f) => (
                <TR key={f.id}>
                  <TD className="font-mono text-xs text-ink-high">{f.type}</TD>
                  <TD><JobStatusPill status={f.status} /></TD>
                  <TD className="tabular-nums">{f.attempts}</TD>
                  <TD className="text-xs text-ink-mid max-w-md truncate" title={f.error ?? ''}>
                    {f.error ?? '—'}
                  </TD>
                  <TD className="text-xs text-ink-low" title={formatDate(f.updatedAt)}>
                    {formatRelative(f.updatedAt)}
                  </TD>
                </TR>
              ))}
              {failures.data?.length === 0 && (
                <TR>
                  <TD colSpan={5} className="py-10 text-center text-ink-low">
                    Zero failures recorded — pipelines healthy.
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

/** Tiny inline bar chart for throughput — pure SVG, no external dep. */
function Throughput({ data }: { data: { bucket: string; count: number; status: JobStatus }[] }) {
  // Aggregate by bucket then split into ok/fail counts for stacking.
  const map = new Map<string, { ok: number; fail: number }>();
  for (const d of data) {
    const cur = map.get(d.bucket) ?? { ok: 0, fail: 0 };
    if (d.status === 'COMPLETED') cur.ok += d.count;
    else if (d.status === 'FAILED' || d.status === 'DEAD_LETTER') cur.fail += d.count;
    map.set(d.bucket, cur);
  }
  const buckets = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(1, ...buckets.map(([, v]) => v.ok + v.fail));

  if (buckets.length === 0) {
    return <div className="text-sm text-ink-low py-12 text-center">No activity in the last 24 hours.</div>;
  }

  return (
    <div className="h-48 flex items-end gap-1">
      {buckets.map(([bucket, v]) => {
        const total = v.ok + v.fail;
        const okH = (v.ok / max) * 100;
        const failH = (v.fail / max) * 100;
        return (
          <div key={bucket} className="flex-1 flex flex-col items-stretch group">
            <div
              className="bg-state-error/70 rounded-t-sm"
              style={{ height: `${failH}%` }}
              title={`${bucket}: ${v.fail} failed`}
            />
            <div
              className="bg-brand-primary/80"
              style={{ height: `${okH}%` }}
              title={`${bucket}: ${v.ok} ok`}
            />
            <div className="hidden group-hover:block text-[10px] text-ink-low text-center mt-1">
              {total}
            </div>
          </div>
        );
      })}
    </div>
  );
}
