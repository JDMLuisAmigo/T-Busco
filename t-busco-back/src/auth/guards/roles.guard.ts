import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Debe usarse SIEMPRE después de JwtAuthGuard (@UseGuards(JwtAuthGuard, RolesGuard)),
// porque depende de que req.user ya exista (lo pone JwtAuthGuard al validar el token).
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sin @Roles(...) en la ruta, no se restringe nada (deja pasar)
    if (!rolesPermitidos || rolesPermitidos.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !rolesPermitidos.includes(user.rol)) {
      throw new ForbiddenException('No tienes permiso para hacer esto.');
    }
    return true;
  }
}
