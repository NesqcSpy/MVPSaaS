import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export type TransformationId = 'union-all' | 'field-mapping';

export class RunExportDto {
  @IsUUID()
  pipelineId!: string;

  /** Optional explicit list of document IDs. Omit to export every validated document since the pipeline's last run. */
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  documentIds?: string[];
}

export class CreatePipelineDto {
  @IsString()
  name!: string;

  @IsOptional() @IsString()
  description?: string;

  @IsUUID()
  integrationId!: string;

  @IsString()
  destination!: string;

  @IsEnum(['union-all', 'field-mapping'])
  transformation!: TransformationId;

  /** Optional rename map applied after the transformation. */
  @IsOptional()
  fieldMappings?: Record<string, string>;

  /** Optional template filter — only feed records of these templates. */
  @IsOptional() @IsArray() @IsString({ each: true })
  templates?: string[];

  @IsOptional() @IsString()
  schedule?: string;
}
