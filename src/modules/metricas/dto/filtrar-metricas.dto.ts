import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoPoi } from '@prisma/client';

export class FiltrarMetricasDto {
  @IsDateString({}, { message: 'Informe uma data de início válida.' })
  periodoInicial!: string;

  @IsDateString({}, { message: 'Informe uma data de fim válida.' })
  periodoFinal!: string;

  @IsOptional() @IsString()
  andar?: string;

  @IsOptional() @IsEnum(TipoPoi)
  tipoDestino?: TipoPoi;

  @IsOptional() @IsString()
  origemAcesso?: string;

  @IsOptional() @IsString()
  statusOcorrencia?: string;

  @IsOptional() @IsString()
  socorristaId?: string;

  @IsOptional() @IsString()
  codigo?: string;
}
