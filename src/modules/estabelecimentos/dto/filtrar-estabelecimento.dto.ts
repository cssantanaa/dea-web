import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoriaEstabelecimento, StatusEstabelecimento } from '@prisma/client';

export class FiltrarEstabelecimentoDto {
  @IsOptional() @IsEnum(StatusEstabelecimento)
  status?: StatusEstabelecimento;

  @IsOptional() @IsEnum(CategoriaEstabelecimento)
  categoria?: CategoriaEstabelecimento;

  @IsOptional() @IsString()
  buscar?: string;
}