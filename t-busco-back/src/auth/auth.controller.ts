import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  registrar(@Body() dto: RegistroDto) {
    return this.authService.registrar(dto);
  }

  @Post('login')
  @HttpCode(200) // por defecto POST responde 201 (creado); iniciar sesión no "crea" nada
  iniciarSesion(@Body() dto: LoginDto) {
    return this.authService.iniciarSesion(dto);
  }

  // Ruta de prueba: si el token es válido, devuelve quién eres.
  // Sirve para confirmar que el login funciona antes de construir más pantallas.
  @UseGuards(JwtAuthGuard)
  @Get('yo')
  yo(@Req() req: any) {
    return this.authService.obtenerPorId(req.user.id);
  }
}
