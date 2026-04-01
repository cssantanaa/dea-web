import { SetMetadata } from "@nestjs/common";

export const CHAVE_PERMISSAO = 'permissao';
export const Permissao = (permissao: string) => SetMetadata(CHAVE_PERMISSAO, permissao);