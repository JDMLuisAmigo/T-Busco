import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Uso: @Roles('reclutador') encima de una ruta. Se combina con
// @UseGuards(JwtAuthGuard, RolesGuard): el primero exige estar
// autenticado, el segundo exige tener uno de los roles indicados.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
