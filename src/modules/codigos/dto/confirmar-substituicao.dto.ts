import { IsBoolean, IsDateString, IsOptional, IsString, Length, Matches } from "class-validator";

export class ConfirmarSubstituicaoDto {
  @IsString() @Length(1, 36)
  codigo!: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9]{6}$/, { message: 'Código inválido.' })
  novoCodigo!: string;

  @IsOptional()
  @IsString()
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