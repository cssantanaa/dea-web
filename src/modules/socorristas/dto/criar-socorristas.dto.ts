import { IsOptional, IsString, Length, Matches } from "class-validator";

export class CriarSocorristaDto {

  @IsString() @Length(3, 80, { message: 'Nome deve ter entre 3 e 80 caracteres.' }) @Matches(/^[a-zA-ZÀ-ÿ0-9 .,\-\/&]+$/, { message: 'Caracteres não permitidos no nome.' })
  nome!: string;

  @IsString() @Length(4, 20, { message: 'Use 4 a 20 caracteres válidos.' }) @Matches(/^[a-zA-Z0-9._-]+$/, { message: 'Use somente letras, números, ponto, hífen e sublinhado.' }) @Matches(/^(?!.*@)/, { message: 'Não use e-mail como identificador.' })
  usuario!: string;

  @IsString() @Length(8, 64, { message: 'Senha deve ter pelo menos 8 caracteres.' })
  senha!: string;

  @IsOptional() @IsString() @Matches(/^\d{10,13}$/, { message: 'Informe um número de celular válido.' })
  telefoneSms?: string;

  @IsOptional() @IsString() @Length(0, 300)
  observacoes?: string;
}