import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service';
import { CrearPostulacionDto } from './dto/crear-postulacion.dto';
import { ActualizarPostulacionDto } from './dto/actualizar-postulacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('postulaciones')
export class PostulacionesController {
  constructor(private readonly postulacionesService: PostulacionesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('aspirante')
  @Post()
  postular(@Req() req: any, @Body() dto: CrearPostulacionDto) {
    return this.postulacionesService.postular(req.user.id, dto.vacanteId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('aspirante')
  @Get('mias')
  listarMias(@Req() req: any) {
    return this.postulacionesService.listarMias(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('reclutador')
  @Get('vacante/:vacanteId')
  listarDeVacante(@Req() req: any, @Param('vacanteId') vacanteId: string) {
    return this.postulacionesService.listarDeVacante(vacanteId, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('reclutador')
  @Put(':id')
  actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: ActualizarPostulacionDto) {
    return this.postulacionesService.actualizar(id, req.user.id, dto);
  }
}
