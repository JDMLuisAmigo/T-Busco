import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificacionEntity } from './entities/notificacion.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(NotificacionEntity)
    private readonly notificaciones: Repository<NotificacionEntity>,
  ) {}

  // La usan otros módulos (postulaciones) para avisarle algo a alguien.
  // No es una ruta HTTP: es un método normal que se llama desde el código.
  crear(usuarioId: string, mensaje: string, enlace?: string) {
    const notificacion = this.notificaciones.create({ usuarioId, mensaje, enlace });
    return this.notificaciones.save(notificacion);
  }

  listar(usuarioId: string) {
    return this.notificaciones.find({ where: { usuarioId }, order: { creadaEn: 'DESC' }, take: 50 });
  }

  async marcarLeida(id: string, usuarioId: string) {
    const notificacion = await this.notificaciones.findOne({ where: { id } });
    if (!notificacion) throw new NotFoundException('Esa notificación no existe.');
    if (notificacion.usuarioId !== usuarioId) throw new ForbiddenException('Esa notificación no es tuya.');
    notificacion.leida = true;
    return this.notificaciones.save(notificacion);
  }

  async marcarTodasLeidas(usuarioId: string) {
    await this.notificaciones.update({ usuarioId, leida: false }, { leida: true });
    return { ok: true };
  }
}
