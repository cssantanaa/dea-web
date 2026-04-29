import {
  IsString,
  Length,
  IsEnum,
  IsOptional,
  IsDateString,
  IsObject,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BarrierSeverity, Visibility } from '@prisma/client';

export const BARRIER_TYPES = [
  'area_interditada',
  'passagem_bloqueada',
  'escada_inoperante',
  'elevador_inoperante',
  'rampa_inoperante',
  'obra',
  'evento_temporario',
  'risco_localizado',
  'outro',
] as const;

export type BarrierType = typeof BARRIER_TYPES[number];

export class CreateBarrierDto {
  @ApiProperty({ enum: BARRIER_TYPES, example: 'elevador_inoperante' })
  @IsString()
  @IsEnum(BARRIER_TYPES, { message: 'Selecione um tipo de barreira válido.' })
  type: BarrierType;

  @ApiPropertyOptional({ example: 'Manutenção programada de bomba hidráulica' })
  @ValidateIf(o => o.type === 'outro')
  @IsString()
  @Length(3, 40, { message: 'Detalhe o tipo (3 a 40 caracteres) quando escolher outro.' })
  typeDetail?: string;

  @ApiProperty({ example: 'Elevador N2 — manutenção' })
  @IsString()
  @Length(3, 60, { message: 'Nome deve ter entre 3 e 60 caracteres.' })
  name: string;

  @ApiProperty({ example: '1º Andar' })
  @IsString()
  @Length(1, 50)
  floor: string;

  @ApiProperty({
    example: { type: 'Point', coordinates: [120.5, 340.2] },
    description: 'Geometria no sistema do mapa: ponto, linha ou polígono',
  })
  @IsObject({ message: 'Posição inválida para este andar.' })
  position: Record<string, unknown>;

  @ApiProperty({ enum: BarrierSeverity, example: 'atencao' })
  @IsEnum(BarrierSeverity, { message: 'Severidade inválida.' })
  severity: BarrierSeverity;

  @ApiPropertyOptional({ enum: Visibility, default: 'publico' })
  @IsOptional()
  @IsEnum(Visibility, { message: 'Visibilidade inválida.' })
  visibility?: Visibility;

  @ApiProperty({ example: '2025-06-10T08:00:00Z', description: 'Início da vigência (obrigatório)' })
  @IsDateString({}, { message: 'Informe uma data de início válida.' })
  periodStart: string;

  @ApiPropertyOptional({ example: '2025-06-10T18:00:00Z', description: 'Fim da vigência (opcional)' })
  @IsOptional()
  @IsDateString({}, { message: 'Informe uma data de fim válida.' })
  periodEnd?: string;

  @ApiPropertyOptional({ example: 'Elevador N2 em manutenção; use a rampa próxima.' })
  @IsOptional()
  @IsString()
  @Length(0, 120)
  shortMessage?: string;
}

// Status não entra no update direto — usa endpoints toggle-status e close
export class UpdateBarrierDto {
  @ApiPropertyOptional({ example: 'Elevador N2 — manutenção emergencial' })
  @IsOptional()
  @IsString()
  @Length(3, 60)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(BarrierSeverity)
  severity?: BarrierSeverity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 120)
  shortMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  position?: Record<string, unknown>;
}

export class ToggleBarrierDto {
  @ApiProperty({ example: true, description: 'true = ativar, false = inativar' })
  @IsBoolean()
  isActive: boolean;
}

export class FilterBarrierDto {
  @ApiPropertyOptional({ example: 'ativa' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '1º Andar' })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiPropertyOptional({ enum: Visibility })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}
