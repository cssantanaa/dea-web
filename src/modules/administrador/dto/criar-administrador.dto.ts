import { ArrayMinSize, IsArray, IsOptional, IsString, Length, Matches } from "class-validator";

export const PERMISSAO_ADMINISTRADOR = [
    'importar-mapas-e-configurar-geofence',
    'gerenciar-pois',
    'gerenciar-socorristas',
    'configurar-numeros-internos',
    'gerar-codigos-qr',
    'configurar-redes-wifi',
    'consultar-metricas',
    'gerenciar-barreiras',
    'consultar-historico'
] as const;

export class AdministradorDto {
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

    @IsArray() @ArrayMinSize(1)
    permissoes!: (typeof PERMISSAO_ADMINISTRADOR)[number][];

    @IsOptional() @IsString() @Length(0, 300)
    observacoes?: string;
}