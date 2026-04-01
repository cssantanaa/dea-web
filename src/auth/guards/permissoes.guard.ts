import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CHAVE_PERMISSAO } from "src/common/decorators/permissao.decorator";

@Injectable()
export class PermissioesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const obrigatorio = this.reflector.get<string>(CHAVE_PERMISSAO, context.getHandler());
        if (!obrigatorio) return true;
        const { usuario } = context.switchToHttp().getRequest();
        if (usuario?.tipo === 'super_admin') return true;
        if (!usuario?.permissao?.includes(obrigatorio)) {
            throw new ForbiddenException('Permissão insuficiente.');
        }
        return true;
    }
}