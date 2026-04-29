import { Visibilidade } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class FiltrarBarreiraDto {
  @IsOptional() @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  andar?: string;

  @IsOptional()
  @IsEnum(Visibilidade)
  visibilidade?: Visibilidade;
}
