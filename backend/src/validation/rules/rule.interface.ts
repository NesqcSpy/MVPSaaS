export type IssueSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  /** Field path the issue applies to (e.g. "total_amount"). Empty string = doc-level. */
  field: string;
  /** Stable rule id ("required", "type", "duplicate", "format", "business"). */
  rule: string;
  severity: IssueSeverity;
  message: string;
  /** Optional structured payload — useful in the UI to render with context. */
  context?: Record<string, unknown>;
}

export interface ValidationContext {
  documentId: string;
  workspaceId: string;
  template: string;
  /** The extraction `data` dictionary. */
  data: Record<string, unknown>;
  /** Confidence per field, copied from the extraction result. */
  fieldScores: Record<string, number>;
}

export interface ValidationRule {
  readonly id: string;
  /** Templates this rule applies to ("*" = any). */
  readonly templates: readonly string[];
  run(ctx: ValidationContext): Promise<ValidationIssue[]> | ValidationIssue[];
}
