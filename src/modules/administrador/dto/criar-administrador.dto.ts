import { ArrayMinSize, IsArray, IsIn, IsOptional, IsString, Length, Matches } from "class-validator";

export const PERMISSAO_ADMINISTRADOR = [
  'importar_mapas_e_configurar_geofence',
  'gerenciar_pois',
  'gerenciar_socorristas',
  'configurar_numeros_internos',
  'gerar_codigos_qr',
  'configurar_redes_wifi',
  'consultar_metricas',
  'gerenciar_barreiras',
  'consultar_historico',
] as const;
 
export type PermissaoAdmin = typeof PERMISSAO_ADMINISTRADOR[number];
 

export class CriarAdministradorDto {
    @IsString() @Length(36, 36)
    estabelecimentoId!: string;

    @IsString() @Length(3, 80)
    nome!: string;

    @IsString() @Length(3, 80) @Matches(/^[a-zA-Z0-9_ ]+$/, {message: 'O nome deve conter apenas letras, números, underscores e espaços.'}) @Matches(/^(?!.*@)/, {message: 'Não pode conter espaços consecutivos.'})
    usuario!: string;

    @IsString() @Length(8, 64)
    senhaInicial!: string;

    @IsString() @Matches(/^\d{10,13}$/, {message: 'Informe um número de telefone válido.'})
    telefone!: string;

    @IsArray() @ArrayMinSize(1) @IsIn(PERMISSAO_ADMINISTRADOR, { each: true, message: 'Permissão inválida.' })
    permissoes!: PermissaoAdmin[]

    @IsOptional() @IsString() @Length(0, 300)
    observacoes?: string;
}