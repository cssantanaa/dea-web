import { CategoriaEstabelecimento, TipoOperacao } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Length, Matches, Max, Min, ValidateIf } from "class-validator";

export class CriarEstabelecimentosDto {
    @IsString() @Length(3, 100)
    nome!: string;

    @IsString() @Length(1, 80)
    clienteOrganizador!: string;

    @IsEnum(TipoOperacao)
    tipoOperacao! : TipoOperacao;

    @ValidateIf(o => o.tipoOperacao === 'evento')
    @IsDateString()
    dataInicioEvento?: string;

    @ValidateIf(o => o.tipoOperacao === 'evento')
    @IsDateString()
    dataFimEvento?: string;

    @IsString()
    @Matches(/^\d{14}$/, {message: 'Informe um CNPJ com 14 dígitos.'})
    cnpj! : string;

    @IsEnum(CategoriaEstabelecimento)
    categoriaEstabelecimento! : CategoriaEstabelecimento;

    @ValidateIf(o => o.categoria === 'outros')
    @IsString() @Length(3, 60)
    detalheCategoria?: string;

    @IsString() @Length(3, 150)
    rua!: string;

    @IsString() @Length(1, 10)
    numero!: string;

    @IsOptional() @IsString() @Length(0, 60)
    complemento!: string;
    
    @IsString() @Length(2, 80)
    bairro!: string;

    @IsString() @Length(2, 80)
    cidade!: string;

    @IsString() 
    @Matches(/^\d[A-Z]{2}$/, {message: 'UF deve ter 2 letras maiúsculas'})
    estado!: string;

    @IsString() 
    @Matches(/^\d{8}$/, {message: 'Informe um CEP deve ter 8 dígitos.'})
    cep!: string;

    @IsInt() @Min(1) @Max(999999999)
    capacidadeEstimada!: number;

    @IsOptional() @IsString() @Length(0, 500)
    observacoesInternas?: string;
}