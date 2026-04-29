import { IsBoolean, IsDateString, IsOptional, IsString, Length, Matches } from "class-validator";

// ssid é omitido — imutável após criação (RF024)
export class AtualizarWifiDto {
  @IsOptional()
  @IsString()
  @Length(3, 60)
  @Matches(/^[a-zA-ZÀ-ÿ0-9 .,\-\/&]+$/, { message: 'Caracteres não permitidos.' })
  nomeExibicao?: string;

  @IsOptional()
  @IsBoolean()
  possuiPortalCativo?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  instrucoesConexao?: string;

  @IsOptional()
  @IsDateString()
  validoDe?: string;

  @IsOptional()
  @IsDateString()
  validoAte?: string;
}
