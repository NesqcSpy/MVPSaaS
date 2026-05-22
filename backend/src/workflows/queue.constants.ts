export const QUEUE = {
  OCR: 'ocr',
  EXTRACTION: 'extraction',
  VALIDATION: 'validation',
  ETL_EXPORT: 'etl.export',
  WORKFLOW: 'workflow',
} as const;

export type QueueName = (typeof QUEUE)[keyof typeof QUEUE];

export const DEFAULT_JOB_OPTS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 2_000 },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};
