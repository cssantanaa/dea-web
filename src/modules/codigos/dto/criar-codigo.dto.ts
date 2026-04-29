import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, Length, Matches, ValidateIf } from "class-validator";
import { ModoGeracao } from "@prisma/client";

export class CriarCodigoDto {
  @IsEnum(ModoGeracao, { message: 'Modo de geração inválido.' })
  modoGeracao!: ModoGeracao;

  @ValidateIf(o => o.generationMode === 'manual') @IsString() @Matches(/^[a-zA-Z0-9]{6}$/, { message: 'Informe exatamente 6 caracteres alfanuméricos (sem espaços ou símbolos).' })
  codigo?: string;

  @IsOptional() @IsString()
  @Length(0, 60)
  descricao?: string;

  @IsOptional()
  @IsDateString()
  validoDe?: string;

  @IsOptional()
  @IsDateString()
  validoAte?: string;

  @IsOptional()
  @IsBoolean()
  gerarQr?: boolean;
}