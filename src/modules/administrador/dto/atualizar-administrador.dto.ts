import { IsString, Length, Matches, IsArray, ArrayMinSize, IsIn, IsOptional } from 'class-validator';
import { PERMISSAO_ADMINISTRADOR, PermissaoAdmin } from './criar-administrador.dto';

export class AtualizarAdministradorDto {
  @IsOptional() @IsString() @Length(3, 80) @Matches(/^[a-zA-ZÀ-ÿ0-9 .,\-\/&]+$/, { message: 'Caracteres não permitidos no nome.' })
  nome?: string;

  @IsOptional() @IsString() @Matches(/^\d{10,13}$/, { message: 'Informe um número de celular válido.' })
  telefoneSms?: string;

  @IsOptional() @IsArray() @ArrayMinSize(1, { message: 'Selecione ao menos uma permissão.' }) @IsIn(PERMISSAO_ADMINISTRADOR, { each: true, message: 'Permissão inválida.' })
  permissoes?: PermissaoAdmin[];

  @IsOptional() @IsString() @Length(0, 300)
  observacoes?: string;
}