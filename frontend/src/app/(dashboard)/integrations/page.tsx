'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Topbar } from '@/components/dashboard/topbar';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, FileSpreadsheet, FileCode2, Webhook, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Integration {
  id: string;
  name: string;
  kind: 'POSTGRES' | 'MYSQL' | 'MSSQL' | 'CSV' | 'EXCEL' | 'HTTP_API' | 'WEBHOOK';
  enabled: boolean;
  lastTestedAt: string | null;
  lastTestStatus: string | null;
  createdAt: string;
}

export default function IntegrationsPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.get<Integration[]>('/integrations'),
  });

  const test = useMutation({
    mutationFn: (id: string) => api.post<{ ok: boolean; error?: string }>(`/etl/integrations/${id}/test`),
    onSettled: () => qc.invalidateQueries({ queryKey: ['integrations'] }),
  });

  return (
    <div>
      <Topbar title="Integrations" subtitle="Sinks DataClean writes structured data to" />
      <div className="p-6 space-y-4">
        {(q.data ?? []).length === 0 && (
          <Card className="text-center py-12">
            <Database className="h-10 w-10 mx-auto text-ink-low mb-3" />
            <div className="text-ink-high font-medium">No integrations configured</div>
            <p className="text-sm text-ink-low mt-1 max-w-md mx-auto">
              POST to <code className="font-mono text-xs text-ink-mid">/api/v1/integrations</code> with kind +
              config to register one.
            </p>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(q.data ?? []).map((i) => (
            <Card key={i.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <KindIcon kind={i.kind} />
                  <div>
                    <CardTitle>{i.name}</CardTitle>
                    <CardDescription>{i.kind.toLowerCase()}</CardDescription>
                  </div>
                </div>
                <Badge tone={i.enabled ? 'success' : 'neutral'}>
                  {i.enabled ? 'enabled' : 'disabled'}
                </Badge>
              </CardHeader>

              <div className="text-xs text-ink-low space-y-1">
                <div>Created: {formatDate(i.createdAt)}</div>
                <div>
                  Last test:{' '}
                  {i.lastTestedAt
                    ? `${formatDate(i.lastTestedAt)} — ${i.lastTestStatus ?? '—'}`
                    : 'never'}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => test.mutate(i.id)} disabled={test.isPending}>
                  {test.isPending ? 'Testing…' : 'Test connection'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function KindIcon({ kind }: { kind: Integration['kind'] }) {
  const map: Record<Integration['kind'], React.ReactNode> = {
    POSTGRES: <Database className="h-5 w-5 text-brand-primary" />,
    MYSQL:    <Database className="h-5 w-5 text-brand-primary" />,
    MSSQL:    <Database className="h-5 w-5 text-brand-primary" />,
    CSV:      <FileText className="h-5 w-5 text-brand-secondary" />,
    EXCEL:    <FileSpreadsheet className="h-5 w-5 text-brand-secondary" />,
    HTTP_API: <FileCode2 className="h-5 w-5 text-brand-accent" />,
    WEBHOOK:  <Webhook className="h-5 w-5 text-brand-accent" />,
  };
  return (
    <div className="h-10 w-10 rounded-lg bg-bg-deep/60 border border-border grid place-items-center">
      {map[kind]}
    </div>
  );
}
