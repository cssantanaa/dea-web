import { SetMetadata } from "@nestjs/common";

export const CHAVE_TIPO_USUARIO = 'tipoUsuario';
export const TipoUsuario = (tipo: string[]) => SetMetadata(CHAVE_TIPO_USUARIO, tipo);