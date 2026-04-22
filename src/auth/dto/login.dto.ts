import { IsString, Length, Matches } from 'class-validator';

export class LoginDto {
    @IsString() @Length(4, 20, { message: 'O usuário deve ter entre 4 e 20 caracteres.' }) @Matches(/^[a-zA-Z0-9._-]+$/, { message: 'Use somente letras, números, ponto, hífen e sublinhado.' }) @Matches(/^(?!.*@)/, { message: 'Use o nome de usuário fornecido pelo administrador. E-mail não é aceito.' })
    usuario!: string;

    @IsString() @Length(8, 64, { message: 'A senha deve ter pelo menos 8 caracteres.' })
    senha!: string;
}