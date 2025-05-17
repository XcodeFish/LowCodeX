import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  schema: string; // JSON Schema 格式

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateFormDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  schema?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class FormQueryDto {
  @IsInt()
  @IsOptional()
  page?: number;

  @IsInt()
  @IsOptional()
  pageSize?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  keyword?: string;
}
