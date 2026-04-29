import { IsString, Length, IsEnum, IsOptional, IsDateString, IsObject, IsBoolean, ValidateIf } from 'class-validator';
import {Prisma , SeveridadeBarreira, Visibilidade } from '@prisma/client';

export const TIPO_BARREIRA = [
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

export type TipoBarreira = typeof TIPO_BARREIRA[number];

export class CriarBarreiraDto {
  @IsString() @IsEnum(TIPO_BARREIRA, { message: 'Selecione um tipo de barreira válido.' })
  tipo!: TipoBarreira;

  @ValidateIf(o => o.tipo === 'outro') @IsString()
  @Length(3, 40, { message: 'Detalhe o tipo (3 a 40 caracteres) quando escolher outro.' })
  detalheTipo?: string;

  @IsString() @Length(3, 60, { message: 'Nome deve ter entre 3 e 60 caracteres.' })
  nome!: string;

  @IsString() @Length(1, 50)
  andar!: string;

  @IsObject({ message: 'Posição inválida para este andar.' })
  posicao!: Prisma.InputJsonValue;
  
  @IsEnum(SeveridadeBarreira, { message: 'Severidade inválida.' })
  severidade!: SeveridadeBarreira;

  @IsOptional()
  @IsEnum(Visibilidade, { message: 'Visibilidade inválida.' })
  visibilidade?: Visibilidade;

  @IsDateString({}, { message: 'Informe uma data de início válida.' })
  periodoInicial!: string;

  @IsOptional() @IsDateString({}, { message: 'Informe uma data de fim válida.' })
  periodoFinal?: string;

  @IsOptional() @IsString() @Length(0, 120)
  observacao?: string;
}
