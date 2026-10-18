import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvEntity } from '../cv/entities/cv.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { VacanteEntity } from '../vacantes/entities/vacante.entity';
import { InvitacionEntity } from './entities/invitacion.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class CandidatosService {
  constructor(
    @InjectRepository(CvEntity) private readonly cvs: Repository<CvEntity>,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(VacanteEntity) private readonly vacantes: Repository<VacanteEntity>,
    @InjectRepository(InvitacionEntity) private readonly invitaciones: Repository<InvitacionEntity>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  // Solo aspirantes activos con al menos un nombre guardado en su CV son
  // "buscables". No se exponen correo, teléfono ni cédula aquí: el
  // reclutador ve un resumen, y solo llega a esos datos si la persona
  // acepta la invitación y se postula (ver postulaciones.service.ts,
  // que sí copia el CV completo al aceptar/postularse).
  async buscar(texto: string) {
    const [cvs, aspirantes] = await Promise.all([
      this.cvs.find(),
      this.usuarios.find({ where: { rol: 'aspirante', activo: true } }),
    ]);
    const idsValidos = new Set(aspirantes.map((a) => a.id));
    const consulta = (texto || '').trim().toLowerCase();

    return cvs
      .filter((cv) => idsValidos.has(cv.id) && cv.datos?.nombre)
      .map((cv) => this.resumen(cv.id, cv.datos))
      .filter((candidato) => !consulta || this.coincide(candidato, consulta));
  }

  private resumen(aspiranteId: string, datos: any) {
    return {
      aspiranteId,
      nombre: datos.nombre,
      cargo: datos.cargo || '',
      ciudad: datos.ciudad || '',
      habilidades: Array.isArray(datos.habilidades) ? datos.habilidades : [],
      experiencia: (Array.isArray(datos.experiencia) ? datos.experiencia : [])
        .slice(0, 2)
        .map((e: any) => ({ cargo: e.cargo, empresa: e.empresa })),
    };
  }

  private coincide(c: ReturnType<CandidatosService['resumen']>, consulta: string) {
    const bolsa = [c.nombre, c.cargo, c.ciudad, ...c.habilidades, ...c.experiencia.map((e) => `${e.cargo} ${e.empresa}`)]
      .join(' ')
      .toLowerCase();
    return bolsa.includes(consulta);
  }

  async invitar(reclutadorId: string, vacanteId: string, aspiranteId: string) {
    const vacante = await this.vacantes.findOne({ where: { id: vacanteId } });
    if (!vacante) throw new NotFoundException('Esa vacante no existe.');
    if (vacante.reclutadorId !== reclutadorId) {
      throw new ForbiddenException('No puedes invitar candidatos a una vacante que no es tuya.');
    }

    const cv = await this.cvs.findOne({ where: { id: aspiranteId } });
    if (!cv?.datos?.nombre) throw new NotFoundException('Ese candidato no existe o no tiene hoja de vida.');

    const yaExiste = await this.invitaciones.findOne({ where: { vacanteId, aspiranteId } });
    if (yaExiste) throw new ConflictException('Ya invitaste a esta persona a postularse a esta vacante.');

    const invitacion = this.invitaciones.create({ vacanteId, reclutadorId, aspiranteId });
    await this.invitaciones.save(invitacion);

    // Reutiliza el sistema de notificaciones que ya existe: no hace falta
    // ningún canal nuevo (correo, etc.) para avisarle al aspirante.
    await this.notificacionesService.crear(
      aspiranteId,
      `${vacante.empresa} te invitó a postularte a "${vacante.titulo}".`,
      `/empleos/${vacanteId}`,
    );

    return invitacion;
  }

  misInvitaciones(reclutadorId: string) {
    return this.invitaciones.find({ where: { reclutadorId } });
  }
}
