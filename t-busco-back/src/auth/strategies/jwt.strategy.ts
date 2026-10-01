import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // lee "Authorization: Bearer <token>"
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'cambia-esto-en-produccion',
    });
  }

  // Lo que esta función retorna queda disponible como "req.user" en cualquier
  // ruta protegida con @UseGuards(JwtAuthGuard). No consulta la base de datos
  // en cada petición: todo lo necesario ya viene dentro del token.
  async validate(payload: { sub: string; correo: string; rol: string }) {
    return { id: payload.sub, correo: payload.correo, rol: payload.rol };
  }
}
