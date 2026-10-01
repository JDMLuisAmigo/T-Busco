import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { VacantesService } from './vacantes.service';
import { CrearVacanteDto } from './dto/crear-vacante.dto';
import { ActualizarVacanteDto } from './dto/actualizar-vacante.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('vacantes')
export class VacantesController {
  constructor(private readonly vacantesService: VacantesService) {}

  // Pública: cualquiera puede ver las vacantes, sin haber iniciado sesión
  @Get()
  listar() {
    return this.vacantesService.listarTodas();
  }

  // OJO con el orden: "mias" debe ir ANTES que ":id", o Nest intentaría
  // interpretar "mias" como si fuera un id de vacante.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('reclutador')
  @Get('mias')
  listarMias(@Req() req: any) {
    return this.vacantesService.listarDe(req.user.id);
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.vacantesService.obtenerUna(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('reclutador')
  @Post()
  crear(@Req() req: any, @Body() dto: CrearVacanteDto) {
    return this.vacantesService.crear(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('reclutador')
  @Put(':id')
  actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: ActualizarVacanteDto) {
    return this.vacantesService.actualizar(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('reclutador')
  @Put(':id/estado')
  alternarEstado(@Req() req: any, @Param('id') id: string) {
    return this.vacantesService.alternarEstado(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('reclutador')
  @Delete(':id')
  eliminar(@Req() req: any, @Param('id') id: string) {
    return this.vacantesService.eliminar(id, req.user.id);
  }
}
