import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { IntegrationKind } from '@prisma/client';

export class CreateIntegrationDto {
  @IsString() @MinLength(1)
  name!: string;

  @IsEnum(IntegrationKind)
  kind!: IntegrationKind;

  @IsObject()
  config!: Record<string, unknown>;

  @IsOptional() @IsObject()
  credentials?: Record<string, unknown>;

  @IsOptional() @IsBoolean()
  enabled?: boolean;
}

export class UpdateIntegrationDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsObject()
  config?: Record<string, unknown>;

  @IsOptional() @IsObject()
  credentials?: Record<string, unknown>;

  @IsOptional() @IsBoolean()
  enabled?: boolean;
}
