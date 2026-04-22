import { IsOptional, IsString, Length, Matches } from "class-validator";

export class SocorristaDto {

  @IsString() @Length(3, 80)
  nome!: string;

  @IsString() @Length(4, 20) @Matches(/^[a-zA-Z0-9._-]+$/) @Matches(/^(?!.*@)/)
  usuario!: string;

  @IsString() @Length(8, 64)
  senha!: string;

  @IsOptional() @Matches(/^\d{10,13}$/)
  telefoneSms?: string;

  @IsOptional() @IsString() @Length(0, 300)
  observacoes?: string;
}