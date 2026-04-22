import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MudarSenhaDto {
  @IsString() @Length(8, 64, { message: 'A senha atual deve ter entre 8 e 64 caracteres.' })
  senhaAtual!: string;

  @IsString() @Length(8, 64, { message: 'A nova senha deve ter pelo menos 8 caracteres.' })
  novaSenha!: string;
}