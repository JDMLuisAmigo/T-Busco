import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Poner @UseGuards(JwtAuthGuard) en un controlador o una ruta exige un
// token válido en el header Authorization; si falta o está vencido,
// NestJS responde 401 automáticamente antes de llegar a tu código.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
