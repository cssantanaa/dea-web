import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { CHAVE_TIPO_USUARIO } from "src/common/decorators/tipos.decorator";
import { Reflector } from "@nestjs/core";

@Injectable()
export class TipoUsuarioGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean {
        const tiposPermitidos = this.reflector.getAllAndOverride<string[]>(CHAVE_TIPO_USUARIO, [context.getHandler(), context.getClass(),]);
        if (!tiposPermitidos) return true;        
        const { usuario } = context.switchToHttp().getRequest();
        if (tiposPermitidos.includes(usuario?.tipo)) {
            return true;
        }
        return false;
    }
}