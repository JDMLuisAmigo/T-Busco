import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, Rol } from '../auth/entities/usuario.entity';
import { VacanteEntity } from '../vacantes/entities/vacante.entity';
import { PostulacionEntity } from '../postulaciones/entities/postulacion.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(VacanteEntity) private readonly vacantes: Repository<VacanteEntity>,
    @InjectRepository(PostulacionEntity) private readonly postulaciones: Repository<PostulacionEntity>,
  ) {}

  async listarUsuarios() {
    const lista = await this.usuarios.find({ order: { creadoEn: 'DESC' } });
    // contrasenaHash NUNCA sale de aquí, ni por accidente
    return lista.map(({ contrasenaHash, ...resto }) => resto);
  }

  async cambiarRol(id: string, rol: Rol, adminId: string) {
    if (id === adminId) {
      throw new ForbiddenException('No puedes cambiar tu propio rol desde aquí.');
    }
    const usuario = await this.usuarios.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Ese usuario no existe.');
    usuario.rol = rol;
    await this.usuarios.save(usuario);
    const { contrasenaHash, ...resto } = usuario;
    return resto;
  }

  async alternarActivo(id: string, adminId: string) {
    if (id === adminId) {
      throw new ForbiddenException('No puedes desactivar tu propia cuenta.');
    }
    const usuario = await this.usuarios.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Ese usuario no existe.');
    usuario.activo = !usuario.activo;
    await this.usuarios.save(usuario);
    const { contrasenaHash, ...resto } = usuario;
    return resto;
  }

  listarVacantes() {
    return this.vacantes.find({ order: { creadaEn: 'DESC' } });
  }

  async alternarEstadoVacante(id: string) {
    const vacante = await this.vacantes.findOne({ where: { id } });
    if (!vacante) throw new NotFoundException('Esa vacante no existe.');
    vacante.estado = vacante.estado === 'activa' ? 'cerrada' : 'activa';
    return this.vacantes.save(vacante);
  }

  async eliminarVacante(id: string) {
    const vacante = await this.vacantes.findOne({ where: { id } });
    if (!vacante) throw new NotFoundException('Esa vacante no existe.');
    await this.vacantes.remove(vacante);
    return { eliminado: true };
  }

  async resumen() {
    const [totalUsuarios, aspirantes, reclutadores, vacantesActivas, vacantesCerradas, totalPostulaciones] =
      await Promise.all([
        this.usuarios.count(),
        this.usuarios.count({ where: { rol: 'aspirante' } }),
        this.usuarios.count({ where: { rol: 'reclutador' } }),
        this.vacantes.count({ where: { estado: 'activa' } }),
        this.vacantes.count({ where: { estado: 'cerrada' } }),
        this.postulaciones.count(),
      ]);
    return { totalUsuarios, aspirantes, reclutadores, vacantesActivas, vacantesCerradas, totalPostulaciones };
  }
}
