'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Topbar } from '@/components/dashboard/topbar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import {
  DocStatusPill,
  ValidationPill,
  type DocStatus,
  type ValidationStatus,
} from '@/components/dashboard/status-pill';
import { formatDate } from '@/lib/utils';
import { Search } from 'lucide-react';

interface DocRow {
  id: string;
  filename: string;
  status: DocStatus;
  kind: string;
  createdAt: string;
  sizeBytes: number;
  extractionResult: { overallScore: number | null } | null;
  validationResult: { status: ValidationStatus } | null;
}
interface DocList {
  items: DocRow[];
  total: number;
  limit: number;
  offset: number;
}

export default function DocumentsPage() {
  const [search, setSearch] = React.useState('');
  const [offset, setOffset] = React.useState(0);
  const limit = 25;

  const q = useQuery({
    queryKey: ['documents', { search, offset }],
    queryFn: () =>
      api.get<DocList>(
        `/documents?limit=${limit}&offset=${offset}${
          search ? `&search=${encodeURIComponent(search)}` : ''
        }`,
      ),
    refetchInterval: 10_000,
  });

  return (
    <div>
      <Topbar title="Documents" subtitle="Ingested documents and their pipeline status" />
      <div className="p-6 space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-low" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
                placeholder="Search filename…"
                className="pl-9"
              />
            </div>
            <div className="text-xs text-ink-low ml-auto">
              {q.data ? `${q.data.total} document(s)` : '—'}
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <Table>
            <THead>
              <TR>
                <TH>Filename</TH>
                <TH>Kind</TH>
                <TH>Status</TH>
                <TH>Validation</TH>
                <TH className="text-right">Score</TH>
                <TH>Uploaded</TH>
              </TR>
            </THead>
            <TBody>
              {(q.data?.items ?? []).map((d) => (
                <TR key={d.id}>
                  <TD className="text-ink-high">{d.filename}</TD>
                  <TD className="capitalize">{d.kind.toLowerCase()}</TD>
                  <TD><DocStatusPill status={d.status} /></TD>
                  <TD>{d.validationResult ? <ValidationPill status={d.validationResult.status} /> : '—'}</TD>
                  <TD className="text-right tabular-nums">
                    {d.extractionResult?.overallScore != null
                      ? d.extractionResult.overallScore.toFixed(2)
                      : '—'}
                  </TD>
                  <TD className="text-xs text-ink-low">{formatDate(d.createdAt)}</TD>
                </TR>
              ))}
              {q.data?.items.length === 0 && (
                <TR>
                  <TD colSpan={6} className="py-10 text-center text-ink-low">
                    No documents found.
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset((o) => Math.max(0, o - limit))}
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!q.data || offset + limit >= q.data.total}
            onClick={() => setOffset((o) => o + limit)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
