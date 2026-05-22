'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api, ApiError } from '@/lib/api';
import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { formatBytes, cn } from '@/lib/utils';

type Kind = 'INVOICE' | 'RECEIPT' | 'PURCHASE_ORDER' | 'GENERIC';

interface UploadItem {
  id: string;            // local uuid
  file: File;
  state: 'queued' | 'uploading' | 'done' | 'error';
  message?: string;
  documentId?: string;
}

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
};

export default function UploadPage() {
  const qc = useQueryClient();
  const [kind, setKind] = React.useState<Kind>('GENERIC');
  const [items, setItems] = React.useState<UploadItem[]>([]);

  const upload = useMutation({
    mutationFn: async (item: UploadItem) => {
      const fd = new FormData();
      fd.append('file', item.file);
      fd.append('kind', kind);
      const res = await api.upload<{ id: string }>('/documents/upload', fd);
      return res;
    },
  });

  const onDrop = React.useCallback(
    (accepted: File[]) => {
      setItems((prev) => [
        ...prev,
        ...accepted.map<UploadItem>((f) => ({
          id: crypto.randomUUID(),
          file: f,
          state: 'queued',
        })),
      ]);
    },
    [],
  );
  const dz = useDropzone({ onDrop, accept: ACCEPT, maxSize: 50 * 1024 * 1024 });

  const start = async () => {
    for (const item of items) {
      if (item.state !== 'queued') continue;
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, state: 'uploading' } : i)));
      try {
        const res = await upload.mutateAsync(item);
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, state: 'done', documentId: res.id } : i,
          ),
        );
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Upload failed';
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, state: 'error', message } : i)),
        );
      }
    }
    qc.invalidateQueries({ queryKey: ['documents'] });
    qc.invalidateQueries({ queryKey: ['monitoring'] });
  };

  return (
    <div>
      <Topbar title="Upload" subtitle="Drop documents to ingest, OCR, extract, validate, and route" />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Document kind</CardTitle>
              <CardDescription>Drives template selection during extraction</CardDescription>
            </div>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {(['GENERIC', 'INVOICE', 'RECEIPT', 'PURCHASE_ORDER'] as Kind[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm border transition',
                  kind === k
                    ? 'border-brand-primary/60 bg-brand-primary/10 text-brand-primary'
                    : 'border-border text-ink-mid hover:text-ink-high hover:border-border-strong',
                )}
              >
                {k.toLowerCase().replace('_', ' ')}
              </button>
            ))}
          </div>
        </Card>

        <div
          {...dz.getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center transition cursor-pointer',
            dz.isDragActive
              ? 'border-brand-primary bg-brand-primary/5'
              : 'border-border hover:border-border-strong bg-bg-deep/30',
          )}
        >
          <input {...dz.getInputProps()} />
          <UploadCloud className="h-10 w-10 mx-auto text-brand-primary mb-3" />
          <div className="text-ink-high font-medium">
            {dz.isDragActive ? 'Drop to ingest' : 'Drag PDFs or images here'}
          </div>
          <div className="text-ink-low text-sm mt-1">
            PDF · PNG · JPG · WEBP · max 50 MB
          </div>
        </div>

        {items.length > 0 && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Upload queue</CardTitle>
                <CardDescription>{items.length} file(s) ready</CardDescription>
              </div>
              <Button onClick={start} disabled={!items.some((i) => i.state === 'queued')}>
                Start ingestion
              </Button>
            </CardHeader>
            <ul className="divide-y divide-border/60">
              {items.map((i) => (
                <li key={i.id} className="py-3 flex items-center gap-4">
                  <FileText className="h-4 w-4 text-ink-low" />
                  <div className="flex-1 min-w-0">
                    <div className="text-ink-high text-sm truncate">{i.file.name}</div>
                    <div className="text-xs text-ink-low">{formatBytes(i.file.size)} · {i.file.type}</div>
                    {i.message && <div className="text-xs text-state-error mt-1">{i.message}</div>}
                  </div>
                  <UploadItemBadge state={i.state} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

function UploadItemBadge({ state }: { state: UploadItem['state'] }) {
  switch (state) {
    case 'queued':    return <Badge tone="neutral">queued</Badge>;
    case 'uploading': return <Badge tone="info"><Loader2 className="h-3 w-3 animate-spin" /> uploading</Badge>;
    case 'done':      return <Badge tone="success"><CheckCircle2 className="h-3 w-3" /> ingested</Badge>;
    case 'error':     return <Badge tone="error"><XCircle className="h-3 w-3" /> failed</Badge>;
  }
}
