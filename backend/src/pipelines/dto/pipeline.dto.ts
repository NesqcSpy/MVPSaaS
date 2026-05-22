import { IsArray, IsEnum, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { PipelineStatus } from '@prisma/client';

export class CreatePipelineDto {
  @IsString() @MinLength(1)
  name!: string;

  @IsOptional() @IsString()
  description?: string;

  @IsObject()
  definition!: {
    integrationId: string;
    destination: string;
    transformation: 'union-all' | 'field-mapping';
    fieldMappings?: Record<string, string>;
    templates?: string[];
  };

  @IsOptional() @IsString()
  schedule?: string;
}

export class UpdatePipelineDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsObject()
  definition?: Record<string, unknown>;

  @IsOptional() @IsString()
  schedule?: string;

  @IsOptional() @IsEnum(PipelineStatus)
  status?: PipelineStatus;
}
