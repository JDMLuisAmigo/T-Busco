import { Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Sin @Roles(): cualquier persona con sesión iniciada (aspirante o
// reclutador) puede ver y marcar SUS PROPIAS notificaciones.
@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  listar(@Req() req: any) {
    return this.notificacionesService.listar(req.user.id);
  }

  @Put('leer-todas')
  marcarTodasLeidas(@Req() req: any) {
    return this.notificacionesService.marcarTodasLeidas(req.user.id);
  }

  @Put(':id/leida')
  marcarLeida(@Req() req: any, @Param('id') id: string) {
    return this.notificacionesService.marcarLeida(id, req.user.id);
  }
}
