import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Disponibilidade, TipoPoi, Visibilidade } from '@prisma/client';
import { CriarPoiDto } from './criar-poi.dto';

// Todos os campos são opcionais na edição.
// Unicidade (nome+andar+tipo) é validada no service.
export class AtualizarPoiDto extends PartialType(CriarPoiDto) {}

export class filtrarPoiDto {
  @IsOptional()
  @IsEnum(TipoPoi)
  tipo?: TipoPoi;

  @IsOptional()
  @IsString()
  andar?: string;

  @IsOptional()
  @IsEnum(Disponibilidade)
  disponibilidade?: Disponibilidade;

  @IsOptional()
  @IsEnum(Visibilidade)
  visibilidade?: Visibilidade;
}