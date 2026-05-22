import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500)
  limit: number = 25;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  offset: number = 0;

  @IsOptional() @IsString()
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
