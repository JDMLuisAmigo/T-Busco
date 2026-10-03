import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostulacionEntity } from './entities/postulacion.entity';
import { ActualizarPostulacionDto } from './dto/actualizar-postulacion.dto';
import { VacanteEntity } from '../vacantes/entities/vacante.entity';
import { CvEntity } from '../cv/entities/cv.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

// Un mensaje distinto según el estado nuevo que le puso el reclutador
const MENSAJE_POR_ESTADO: Record<string, (titulo: string, empresa: string) => string> = {
  entrevista: (t, e) => `¡Buenas noticias! ${e} te invitó a una entrevista para "${t}".`,
  aceptada: (t, e) => `¡Felicitaciones! Fuiste aceptado/a para "${t}" en ${e}.`,
  rechazada: (t, e) => `Tu postulación a "${t}" en ${e} no fue seleccionada esta vez.`,
  enviada: (t, e) => `Tu postulación a "${t}" en ${e} volvió a quedar en revisión.`,
};

@Injectable()
export class PostulacionesService {
  constructor(
    @InjectRepository(PostulacionEntity) private readonly postulaciones: Repository<PostulacionEntity>,
    @InjectRepository(VacanteEntity) private readonly vacantes: Repository<VacanteEntity>,
    @InjectRepository(CvEntity) private readonly cvs: Repository<CvEntity>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async postular(aspiranteId: string, vacanteId: string) {
    const vacante = await this.vacantes.findOne({ where: { id: vacanteId } });
    if (!vacante) throw new NotFoundException('Esa vacante no existe.');

    const cv = await this.cvs.findOne({ where: { id: aspiranteId } });
    if (!cv?.datos?.nombre || !cv?.datos?.correo) {
      throw new BadRequestException('Completa y guarda tu hoja de vida antes de postularte.');
    }

    const yaExiste = await this.postulaciones.findOne({ where: { vacanteId, aspiranteId } });
    if (yaExiste) throw new ConflictException('Ya te habías postulado a esta vacante.');

    const postulacion = this.postulaciones.create({
      vacanteId,
      aspiranteId,
      vacanteTitulo: vacante.titulo,
      vacanteEmpresa: vacante.empresa,
      cvSnapshot: cv.datos,
      estado: 'enviada',
    });
    const guardada = await this.postulaciones.save(postulacion);

    // Avisa al reclutador dueño de la vacante que le llegó un candidato
    await this.notificacionesService.crear(
      vacante.reclutadorId,
      `${cv.datos.nombre} se postuló a tu vacante "${vacante.titulo}".`,
      `/panel/vacantes/${vacanteId}/candidatos`,
    );

    return guardada;
  }

  // El puntaje y el comentario son notas internas del reclutador: no se le
  // envían al aspirante, ni siquiera ocultos (si solo se escondieran en la
  // pantalla, cualquiera podría verlos abriendo las herramientas de
  // desarrollador del navegador). Por eso se quitan aquí, en el backend.
  async listarMias(aspiranteId: string) {
    const lista = await this.postulaciones.find({ where: { aspiranteId }, order: { creadaEn: 'DESC' } });
    return lista.map(({ puntaje, comentario, ...resto }) => resto);
  }

  async listarDeVacante(vacanteId: string, reclutadorId: string) {
    await this.verificarDuenoDeVacante(vacanteId, reclutadorId);
    return this.postulaciones.find({ where: { vacanteId }, order: { creadaEn: 'DESC' } });
  }

  async actualizar(id: string, reclutadorId: string, dto: ActualizarPostulacionDto) {
    const postulacion = await this.postulaciones.findOne({ where: { id } });
    if (!postulacion) throw new NotFoundException('Esa postulación no existe.');
    await this.verificarDuenoDeVacante(postulacion.vacanteId, reclutadorId);

    const estadoAnterior = postulacion.estado;
    Object.assign(postulacion, dto);
    const guardada = await this.postulaciones.save(postulacion);

    // Solo avisa al aspirante si el ESTADO realmente cambió (no si el
    // reclutador solo actualizó el puntaje o el comentario, que son privados)
    if (dto.estado && dto.estado !== estadoAnterior) {
      const mensaje = (MENSAJE_POR_ESTADO[dto.estado] || (() => 'Tu postulación cambió de estado.'))(
        postulacion.vacanteTitulo,
        postulacion.vacanteEmpresa,
      );
      await this.notificacionesService.crear(postulacion.aspiranteId, mensaje, '/postulaciones');
    }

    return guardada;
  }

  private async verificarDuenoDeVacante(vacanteId: string, reclutadorId: string) {
    const vacante = await this.vacantes.findOne({ where: { id: vacanteId } });
    if (!vacante) throw new NotFoundException('Esa vacante no existe.');
    if (vacante.reclutadorId !== reclutadorId) {
      throw new ForbiddenException('No puedes ver ni modificar postulaciones de una vacante que no es tuya.');
    }
  }
}
