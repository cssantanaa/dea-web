import { Prisma , SeveridadeBarreira, Visibilidade } from "@prisma/client";
import { IsDateString, IsEnum, IsObject, IsOptional, IsString, Length } from "class-validator";

export class AtualizarBarreiraDto {
  @IsOptional() @IsString() @Length(3, 60)
  nome?: string;

  @IsOptional()
  @IsEnum(SeveridadeBarreira)
  severidade?: SeveridadeBarreira;

  @IsOptional()
  @IsEnum(Visibilidade)
  visibilidade?: Visibilidade;

  @IsOptional() @IsDateString()
  periodoInicial?: string;

  @IsOptional() @IsDateString()
  periodoFinal?: string;

  @IsOptional() @IsString() @Length(0, 120)
  observacao?: string;

  @IsOptional()
  @IsObject()
  posicao?: Prisma.InputJsonValue;
}