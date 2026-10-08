import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CambiarRolDto } from './dto/cambiar-rol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// TODO lo de aquí abajo exige sesión Y rol "administrador".
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('resumen')
  resumen() {
    return this.adminService.resumen();
  }

  @Get('usuarios')
  listarUsuarios() {
    return this.adminService.listarUsuarios();
  }

  @Put('usuarios/:id/rol')
  cambiarRol(@Req() req: any, @Param('id') id: string, @Body() dto: CambiarRolDto) {
    return this.adminService.cambiarRol(id, dto.rol, req.user.id);
  }

  @Put('usuarios/:id/estado')
  alternarActivo(@Req() req: any, @Param('id') id: string) {
    return this.adminService.alternarActivo(id, req.user.id);
  }

  @Get('vacantes')
  listarVacantes() {
    return this.adminService.listarVacantes();
  }

  @Put('vacantes/:id/estado')
  alternarEstadoVacante(@Param('id') id: string) {
    return this.adminService.alternarEstadoVacante(id);
  }

  @Delete('vacantes/:id')
  eliminarVacante(@Param('id') id: string) {
    return this.adminService.eliminarVacante(id);
  }
}
