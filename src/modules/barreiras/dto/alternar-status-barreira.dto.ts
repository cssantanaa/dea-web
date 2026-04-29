import { IsBoolean } from "class-validator";

export class AlterarStatusBarreiraDto {
  @IsBoolean()
  ativo!: boolean;
}