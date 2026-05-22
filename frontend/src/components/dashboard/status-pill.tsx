import { Badge } from '@/components/ui/badge';

export type DocStatus =
  | 'PENDING' | 'UPLOADED'
  | 'OCR_RUNNING' | 'OCR_COMPLETE'
  | 'EXTRACTING' | 'EXTRACTED'
  | 'VALIDATING' | 'VALIDATED'
  | 'EXPORTING' | 'EXPORTED'
  | 'FAILED';

export type JobStatus =
  | 'QUEUED' | 'RUNNING' | 'RETRYING'
  | 'COMPLETED' | 'FAILED' | 'DEAD_LETTER' | 'CANCELLED';

export type ValidationStatus = 'PASSED' | 'PASSED_WITH_WARNINGS' | 'FAILED';

const DOC_TONE: Record<DocStatus, 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'neutral',
  UPLOADED: 'neutral',
  OCR_RUNNING: 'info',
  OCR_COMPLETE: 'info',
  EXTRACTING: 'brand',
  EXTRACTED: 'brand',
  VALIDATING: 'warning',
  VALIDATED: 'success',
  EXPORTING: 'info',
  EXPORTED: 'success',
  FAILED: 'error',
};

const JOB_TONE: Record<JobStatus, 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info'> = {
  QUEUED: 'neutral',
  RUNNING: 'info',
  RETRYING: 'warning',
  COMPLETED: 'success',
  FAILED: 'error',
  DEAD_LETTER: 'error',
  CANCELLED: 'neutral',
};

export function DocStatusPill({ status }: { status: DocStatus }) {
  return <Badge tone={DOC_TONE[status]}>{status.replaceAll('_', ' ').toLowerCase()}</Badge>;
}

export function JobStatusPill({ status }: { status: JobStatus }) {
  return <Badge tone={JOB_TONE[status]}>{status.replaceAll('_', ' ').toLowerCase()}</Badge>;
}

export function ValidationPill({ status }: { status: ValidationStatus }) {
  const tone =
    status === 'PASSED' ? 'success'
  : status === 'PASSED_WITH_WARNINGS' ? 'warning'
  : 'error';
  return <Badge tone={tone}>{status.replaceAll('_', ' ').toLowerCase()}</Badge>;
}
