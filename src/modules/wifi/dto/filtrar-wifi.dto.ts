import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class FiltrarWifiDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  ativo?: boolean;
}