import { IsString, Length, Matches, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CriarWifiDto {
  @IsString() @Length(3, 60, { message: 'Nome deve ter entre 3 e 60 caracteres.' })
  @Matches(/^[a-zA-ZÀ-ÿ0-9 .,\-\/&]+$/, { message: 'Caracteres não permitidos no nome.' })
  nomeExibicao!: string;

  @IsString() @Length(1, 32, { message: 'SSID deve ter entre 1 e 32 caracteres.' })
  // Permite letras, números, espaços e símbolos comuns de SSID
  @Matches(/^[^\x00-\x1F\x7F]+$/, { message: 'SSID contém caracteres de controle inválidos.' })
  ssid!: string;

  @IsBoolean()
  possuiPortalCativo!: boolean;

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