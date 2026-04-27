import { IsOptional, IsString, Length, Matches } from "class-validator";

export class AtualizarSocorristaDto {
  @IsOptional() @IsString() @Length(3, 80) @Matches(/^[a-zA-ZÀ-ÿ0-9 .,\-\/&]+$/, { message: 'Caracteres não permitidos.' })
  nome?: string;
 
  @IsOptional() @IsString() @Matches(/^\d{10,13}$/, { message: 'Informe um número de celular válido.' })
  telefoneSms?: string;
 
  @IsOptional() @IsString() @Length(0, 300)
  observacoes?: string;
}