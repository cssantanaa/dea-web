import { CategoriaEstabelecimento, TipoOperacao } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Length, Matches, Max, Min, ValidateIf } from "class-validator";

export class AtualizarEstabelecimentoDto {
  @IsOptional() @IsString() @Length(3, 100) @Matches(/^[a-zA-ZÀ-ÿ0-9 .,\-\/&]+$/, { message: 'Caracteres não permitidos no nome.' })
  nome?: string;

  @IsOptional() @IsEnum(CategoriaEstabelecimento)
  categoria?: CategoriaEstabelecimento;

  @ValidateIf(o => o.categoria === 'outros') @IsString() @Length(3, 60)
  detalheCategoria?: string;

  @IsOptional() @IsString() @Length(3, 150)
  rua?: string;

  @IsOptional() @IsString() @Length(1, 10)
  numero?: string;

  @IsOptional() @IsString() @Length(0, 60)
  complemento?: string;

  @IsOptional() @IsString() @Length(2, 80)
  bairro?: string;

  @IsOptional() @IsString() @Length(2, 80)
  cidade?: string;

  @IsOptional() @IsString() @Matches(/^[A-Z]{2}$/, { message: 'UF deve ter 2 letras maiúsculas.' })
  estado?: string;

  @IsOptional() @IsString() @Matches(/^\d{8}$/, { message: 'CEP deve ter 8 dígitos numéricos.' })
  cep?: string;

  @IsInt() @Min(1) @Max(999999999)
  capacidadeEstimada?: number;

  @IsOptional() @IsString() @Length(0, 500)
  notasInternas?: string;

  @IsOptional() @IsDateString()
  dataInicioEvento?: string;

  @IsOptional() @IsDateString()
  dataFimEvento?: string;
}