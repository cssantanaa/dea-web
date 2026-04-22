import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, Length, Matches } from "class-validator";

export class CodigoQrDto {
  @IsEnum(['automatico', 'manual'])
  generationMode: 'automatico' | 'manual';

  @IsOptional() @IsString()
  @Matches(/^[a-zA-Z0-9]{6}$/)
  codigo?: string;

  @IsOptional() @IsString() @Length(0, 60)
  descricao?: string;

  @IsOptional() @IsDateString()
  validoDe?: string;

  @IsOptional() @IsDateString()
  validoAte?: string;

  @IsOptional() @IsBoolean()
  gerarQr?: boolean;
}