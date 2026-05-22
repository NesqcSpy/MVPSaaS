'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Topbar } from '@/components/dashboard/topbar';
import { MetricCard } from '@/components/dashboard/metric-card';
import { DocStatusPill, type DocStatus } from '@/components/dashboard/status-pill';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Cpu, Activity, CheckCircle2 } from 'lucide-react';
import { formatNumber, formatRelative } from '@/lib/utils';

interface Overview {
  documents: { total: number; byStatus: Record<string, number> };
  jobs: { byStatus: Record<string, number>; last24h: number };
  latency: { ocrMs: number; extractionMs: number; avgExtractionScore: number };
  exports: { completed: number };
  queues: Array<{ name: string; waiting: number; active: number; completed: number; failed: number; delayed: number }>;
}

interface RecentDoc {
  id: string;
  filename: string;
  status: DocStatus;
  kind: string;
  createdAt: string;
  extractionResult?: { overallScore: number | null; template: string } | null;
  validationResult?: { status: string } | null;
}

export default function DashboardPage() {
  const overview = useQuery({
    queryKey: ['monitoring', 'overview'],
    queryFn: () => api.get<Overview>('/monitoring/overview'),
    refetchInterval: 15_000,
  });

  const recent = useQuery({
    queryKey: ['monitoring', 'recent-documents'],
    queryFn: () => api.get<RecentDoc[]>('/monitoring/documents/recent'),
    refetchInterval: 15_000,
  });

  return (
    <div>
      <Topbar
        title="Overview"
        subtitle="Pipeline health, throughput, and recent activity"
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Documents"
            value={formatNumber(overview.data?.documents.total ?? 0)}
            sub={`${overview.data?.documents.byStatus.EXPORTED ?? 0} exported`}
            icon={<FileText className="h-4 w-4 text-ink-low" />}
          />
          <MetricCard
            label="Jobs (24h)"
            value={formatNumber(overview.data?.jobs.last24h ?? 0)}
            sub={`${overview.data?.jobs.byStatus.COMPLETED ?? 0} ok · ${overview.data?.jobs.byStatus.FAILED ?? 0} failed`}
            icon={<Activity className="h-4 w-4 text-ink-low" />}
            tone={(overview.data?.jobs.byStatus.FAILED ?? 0) > 0 ? 'warning' : 'success'}
          />
          <MetricCard
            label="OCR latency"
            value={`${overview.data?.latency.ocrMs ?? 0} ms`}
            sub="avg per page"
            icon={<Cpu className="h-4 w-4 text-ink-low" />}
            tone="brand"
          />
          <MetricCard
            label="Extraction score"
            value={(overview.data?.latency.avgExtractionScore ?? 0).toFixed(2)}
            sub="avg confidence"
            icon={<CheckCircle2 className="h-4 w-4 text-ink-low" />}
            tone="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div>
                <CardTitle>Recent documents</CardTitle>
                <CardDescription>Most recent uploads across the workspace</CardDescription>
              </div>
            </CardHeader>
            <ul className="divide-y divide-border/60">
              {(recent.data ?? []).map((d) => (
                <li key={d.id} className="py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-ink-high text-sm truncate">{d.filename}</div>
                    <div className="text-xs text-ink-low mt-0.5">
                      {d.kind.toLowerCase()} · {formatRelative(d.createdAt)}
                      {d.extractionResult?.template && ` · ${d.extractionResult.template}`}
                    </div>
                  </div>
                  <div className="text-right text-xs text-ink-low w-16 tabular-nums">
                    {d.extractionResult?.overallScore != null
                      ? d.extractionResult.overallScore.toFixed(2)
                      : '—'}
                  </div>
                  <DocStatusPill status={d.status} />
                </li>
              ))}
              {recent.data?.length === 0 && (
                <li className="py-8 text-center text-sm text-ink-low">
                  No documents yet — head to <span className="text-brand-primary">Upload</span> to get started.
                </li>
              )}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Queue health</CardTitle>
                <CardDescription>BullMQ live counters</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-3">
              {(overview.data?.queues ?? []).map((q) => (
                <div key={q.name} className="border border-border rounded-lg p-3 bg-bg-deep/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-ink-high">{q.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-low">
                      <span className="h-1.5 w-1.5 rounded-full bg-state-success animate-pulse-dot" />
                      live
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-xs text-ink-mid">
                    <QStat label="wait" v={q.waiting} />
                    <QStat label="run" v={q.active} tone="info" />
                    <QStat label="ok" v={q.completed} tone="success" />
                    <QStat label="fail" v={q.failed} tone={q.failed > 0 ? 'error' : 'neutral'} />
                    <QStat label="delay" v={q.delayed} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QStat({ label, v, tone = 'neutral' }: { label: string; v: number; tone?: 'neutral' | 'info' | 'success' | 'error' }) {
  const cls =
    tone === 'success' ? 'text-state-success'
  : tone === 'error'   ? 'text-state-error'
  : tone === 'info'    ? 'text-state-info'
  : 'text-ink-high';
  return (
    <div className="text-center">
      <div className={`${cls} font-semibold tabular-nums`}>{v}</div>
      <div className="text-ink-low text-[10px] uppercase tracking-wide">{label}</div>
    </div>
  );
}
