import { SetMetadata } from "@nestjs/common";

export const CHAVE_TIPO_USUARIO = 'super_admin';
export const TipoUsuario = (tipo: string[]) => SetMetadata(CHAVE_TIPO_USUARIO, tipo);