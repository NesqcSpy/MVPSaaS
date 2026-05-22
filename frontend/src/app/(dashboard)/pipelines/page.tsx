'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Topbar } from '@/components/dashboard/topbar';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Database, Workflow } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Pipeline {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  definition: {
    integrationId: string;
    destination: string;
    transformation: 'union-all' | 'field-mapping';
    templates?: string[];
    lastRunAt?: string;
  };
  schedule: string | null;
  createdAt: string;
  _count?: { jobs: number };
}

export default function PipelinesPage() {
  const q = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => api.get<Pipeline[]>('/pipelines'),
    refetchInterval: 15_000,
  });

  return (
    <div>
      <Topbar title="Pipelines" subtitle="ETL routes feeding extracted data into downstream systems" />
      <div className="p-6 space-y-4">
        {(q.data ?? []).length === 0 && (
          <Card className="text-center py-12">
            <Workflow className="h-10 w-10 mx-auto text-ink-low mb-3" />
            <div className="text-ink-high font-medium">No pipelines yet</div>
            <p className="text-sm text-ink-low mt-1 max-w-md mx-auto">
              Create an integration first, then a pipeline that routes validated extractions into it.
            </p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(q.data ?? []).map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-brand-primary" />
                    {p.name}
                  </CardTitle>
                  <CardDescription>{p.description ?? '—'}</CardDescription>
                </div>
                <StatusBadge status={p.status} />
              </CardHeader>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Cell label="Transformation" value={p.definition.transformation} />
                <Cell label="Destination" value={p.definition.destination} mono />
                <Cell label="Templates" value={p.definition.templates?.join(', ') ?? 'all'} />
                <Cell label="Schedule" value={p.schedule ?? 'manual'} mono />
                <Cell
                  label="Last run"
                  value={p.definition.lastRunAt ? formatDate(p.definition.lastRunAt) : '—'}
                />
                <Cell label="Jobs" value={String(p._count?.jobs ?? 0)} />
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-ink-low">
                <Database className="h-3 w-3" />
                <span>Integration: {p.definition.integrationId.slice(0, 8)}…</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border p-2.5 bg-bg-deep/40">
      <div className="text-[10px] uppercase tracking-wide text-ink-low">{label}</div>
      <div className={`mt-0.5 text-ink-high ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: Pipeline['status'] }) {
  if (status === 'ACTIVE')   return <Badge tone="success">active</Badge>;
  if (status === 'PAUSED')   return <Badge tone="warning">paused</Badge>;
  return <Badge tone="neutral">archived</Badge>;
}
