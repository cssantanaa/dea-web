import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class FiltrarSocorristasDto {
  @IsOptional() @IsString()
  buscar?: string;

  @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean()
  ativo?: boolean;
}