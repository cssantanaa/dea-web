import { IsBoolean, IsEnum, IsOptional, IsString, Length, Matches } from "class-validator";

export class CriarSocorristaDto {
    @IsString() @Length(3, 80)
    nome!: string;

    @IsString() @Length(4, 20) @Matches(/^[a-zA-Z0-9_ ]+$/, {message: 'O nome deve conter apenas letras, números, underscores e espaços.'}) @Matches(/^(?!.*@)/, {message: 'Não pode conter espaços consecutivos.'})
    usuario!: string;

    @IsString() @Matches(/^\d{10,13}$/, {message: 'Informe um número de telefone válido.'})
    telefone!: string;

    @IsEnum(['ativo', 'inativo']) 
    status!: string;

    @IsOptional() @IsString() @Length(0, 300)
    observacoes?: string;

    @IsBoolean()
    ativo?: boolean;
}