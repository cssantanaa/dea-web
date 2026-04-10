import { Acessibilidade, Disponibilidade, TipoPoi, Visibilidade } from "@prisma/client";
import { IsEnum, IsInt, IsObject, IsOptional, IsString, Length, Max, Min } from "class-validator";

export class PoiDto {

    @IsEnum(TipoPoi)
    tipo!: TipoPoi;

    @IsOptional() @IsString() @Length(3, 40)
    detalheTipo?: string;

    @IsString() @Length(3, 60)
    nome!: string;

    @IsString() @Length(1, 50)
    andar!: string;

    @IsObject()
    posicao!: Record<string, unknown>;

    @IsOptional() @IsEnum(Acessibilidade)
    acessibilidade?: Acessibilidade;

    @IsOptional() @IsEnum(Disponibilidade)
    disponibilidade?: Disponibilidade;

    @IsOptional() @IsEnum(Visibilidade)
    visibilidade?: Visibilidade;

    @IsOptional() @IsString() @Length(0, 40)
    capacidadeOuDetalhes?: string;

    @IsOptional() @IsInt() @Min(1) @Max(5)
    prioridadeRota?: number;
}