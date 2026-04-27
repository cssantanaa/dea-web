import { Acessibilidade, Disponibilidade, TipoPoi, Visibilidade } from "@prisma/client";
import { IsEnum, IsInt, IsObject, IsOptional, IsString, Length, Matches, Max, Min, ValidateIf } from "class-validator";
import { Prisma } from "@prisma/client";

export class CriarPoiDto {
    @IsEnum(TipoPoi, { message: 'Selecione um tipo de POI válido.' })
    tipo!: TipoPoi;

    @ValidateIf(o => o.type === 'outro') @IsString() @Length(3, 40, { message: 'Detalhe o tipo (3 a 40 caracteres) quando escolher outro.' })
    detalheTipo?: string;

    @IsString()   @Length(3, 60, { message: 'Nome deve ter entre 3 e 60 caracteres.' })
    nome!: string;

    @IsString() @Length(1, 50, { message: 'Andar deve ter entre 1 e 50 caracteres.' })
    andar!: string;

    @IsObject({ message: 'Posição inválida para este andar.' })
    posicao!: Prisma.InputJsonValue;

    @IsOptional() @IsEnum(Acessibilidade)
    acessibilidade?: Acessibilidade;

    @IsOptional() @IsEnum(Disponibilidade)
    disponibilidade?: Disponibilidade;

    @IsOptional() @IsEnum(Visibilidade)
    visibilidade?: Visibilidade;

    @IsOptional() @IsString() @Length(0, 40, { message: 'Capacidade ou detalhes deve ter entre 0 e 40 caracteres.' }) @Matches(/^[a-zA-ZÀ-ÿ0-9 \-\/\.]+$/, { message: 'Caracteres não permitidos.' })
    capacidadeOuDetalhes?: string;

    @IsOptional() @IsInt() @Min(1) @Max(5, { message: 'Prioridade da rota deve ser um número entre 1 e 5.' })
    prioridadeRota?: number;
}