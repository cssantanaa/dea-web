import { IsString, Length, Matches } from "class-validator";

export class LoginDto {
    @IsString() @Length(4, 20) @Matches(/^[a-zA-Z0-9._-]+$/, { message: 'Formato de usuário inválido.'})
    usuario: string;

    @IsString() @Length(8, 64)
    senha: string;
}