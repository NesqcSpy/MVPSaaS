import { IsEnum, IsOptional } from 'class-validator';
import { DocumentKind } from '@prisma/client';

export class UploadDocumentDto {
  @IsOptional()
  @IsEnum(DocumentKind)
  kind?: DocumentKind;
}
