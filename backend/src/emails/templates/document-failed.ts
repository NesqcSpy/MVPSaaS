import { renderEmail } from '../layout';

export interface DocumentFailedProps {
  filename: string;
  documentId: string;
  stage: 'OCR' | 'EXTRACTION' | 'VALIDATION' | 'EXPORT';
  errorMessage: string;
  documentUrl: string;
}

const STAGE_COPY: Record<DocumentFailedProps['stage'], string> = {
  OCR: 'OCR failed before extraction could begin.',
  EXTRACTION: 'The template ran but could not produce a confident result.',
  VALIDATION: 'Extracted fields failed the validation rules.',
  EXPORT: 'The downstream connector rejected the batch.',
};

export function documentFailedEmail({
  filename,
  documentId,
  stage,
  errorMessage,
  documentUrl,
}: DocumentFailedProps) {
  return {
    subject: `[DataClean] ${stage} failed — ${filename}`,
    html: renderEmail({
      preheader: `${stage} failed for ${filename}.`,
      title: 'A document needs attention',
      intro:
        `Processing failed at the <strong>${stage.toLowerCase()}</strong> stage for ` +
        `<strong>${escape(filename)}</strong>. ${STAGE_COPY[stage]}`,
      body: `
        <div style="margin:18px 0;border:1px solid #E2E8F0;border-radius:10px;background:#F8FAFC;padding:14px 16px;font-family:JetBrains Mono,Menlo,monospace;font-size:12px;color:#0F172A;line-height:1.55;">
          <div style="color:#64748B;">document_id</div>
          <div style="word-break:break-all;">${escape(documentId)}</div>
          <div style="color:#64748B;margin-top:10px;">error</div>
          <div style="word-break:break-word;color:#B91C1C;">${escape(errorMessage)}</div>
        </div>
      `,
      ctaLabel: 'Open document',
      ctaHref: documentUrl,
      footnote:
        "Reprocess from the document page once the underlying issue is resolved. Recurring failures? Check the Monitoring tab for queue diagnostics.",
    }),
  };
}

function escape(s: string): string {
  return String(s).replace(/[<>&"']/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}
