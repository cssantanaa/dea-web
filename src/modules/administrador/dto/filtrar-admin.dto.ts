import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FiltrarAdminDto {
  @IsOptional()
  @IsString()
  buscar?: string;

  @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean()
  ativo?: boolean;
}