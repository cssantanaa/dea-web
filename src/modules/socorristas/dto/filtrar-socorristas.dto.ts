import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class FiltrarSocorristasDto {
  @IsOptional() @IsString()
  buscar?: string;
 
  @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean()
  ativo?: boolean;
}