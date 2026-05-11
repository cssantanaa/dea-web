import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ConsultaAuditoriaDto {
  @IsDateString({}, { message: 'Informe uma data de início válida.' })
  periodoInicio!: string;

  @IsDateString({}, { message: 'Informe uma data de fim válida.' })
  periodoFim!: string;

  @IsOptional() @IsString()
  papelUsuarioResponsavel?: string;

  @IsOptional() @IsString()
  tipoEvento?: string;

  @IsOptional() @IsString()
  recursoAfetado?: string;

  @IsOptional()
  @IsEnum(['sucesso', 'falha'], {message: 'Resultado deve ser "sucesso" ou "falha".'})
  resultado?: 'sucesso' | 'falha';

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  pagina?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limite?: number;
}