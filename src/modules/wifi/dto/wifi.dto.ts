import { IsBoolean, IsDateString, IsOptional, IsString, Length } from "class-validator";


export class WifiDto {
  @IsString() @Length(3, 60)
  nome!: string;

  @IsString() @Length(1, 32)
  ssid!: string;

  @IsBoolean()
  hasCaptivePortal!: boolean;

  @IsOptional() @IsString() @Length(0, 120)
  connectionInstructions?: string;

  @IsOptional() @IsDateString()
  validFrom?: string;

  @IsOptional() @IsDateString()
  validUntil?: string;
}