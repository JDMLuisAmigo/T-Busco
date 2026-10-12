import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CambiarRolDto } from './dto/cambiar-rol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// El guard va a nivel de clase (toda ruta de aquí exige sesión), pero
// @Roles ahora va en CADA método: "tecnico" solo puede entrar a las de
// lectura (ver), nunca a las que crean, cambian o borran algo. Eso es
// lo que lo distingue de "administrador", que puede todo.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('administrador', 'tecnico')
  @Get('resumen')
  resumen() {
    return this.adminService.resumen();
  }

  @Roles('administrador', 'tecnico')
  @Get('usuarios')
  listarUsuarios() {
    return this.adminService.listarUsuarios();
  }

  @Roles('administrador')
  @Put('usuarios/:id/rol')
  cambiarRol(@Req() req: any, @Param('id') id: string, @Body() dto: CambiarRolDto) {
    return this.adminService.cambiarRol(id, dto.rol, req.user.id);
  }

  @Roles('administrador')
  @Put('usuarios/:id/estado')
  alternarActivo(@Req() req: any, @Param('id') id: string) {
    return this.adminService.alternarActivo(id, req.user.id);
  }

  @Roles('administrador', 'tecnico')
  @Get('vacantes')
  listarVacantes() {
    return this.adminService.listarVacantes();
  }

  @Roles('administrador')
  @Put('vacantes/:id/estado')
  alternarEstadoVacante(@Param('id') id: string) {
    return this.adminService.alternarEstadoVacante(id);
  }

  @Roles('administrador')
  @Delete('vacantes/:id')
  eliminarVacante(@Param('id') id: string) {
    return this.adminService.eliminarVacante(id);
  }

  // Solo lectura, para "tecnico" y "administrador". No existe un PUT ni
  // un DELETE aquí a propósito: cambiar el estado de una postulación
  // sigue siendo solo del reclutador dueño de esa vacante (ver
  // postulaciones.controller.ts), ni siquiera un administrador lo hace
  // desde este panel.
  @Roles('administrador', 'tecnico')
  @Get('postulaciones')
  listarPostulaciones() {
    return this.adminService.listarPostulaciones();
  }
}
