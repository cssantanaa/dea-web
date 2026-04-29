import { IsBoolean } from "class-validator";

export class AlternarWifiDto {
  @IsBoolean()
  ativo!: boolean;
}