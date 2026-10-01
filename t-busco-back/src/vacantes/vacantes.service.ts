import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VacanteEntity } from './entities/vacante.entity';
import { CrearVacanteDto } from './dto/crear-vacante.dto';
import { ActualizarVacanteDto } from './dto/actualizar-vacante.dto';

@Injectable()
export class VacantesService {
  constructor(
    @InjectRepository(VacanteEntity)
    private readonly vacantes: Repository<VacanteEntity>,
  ) {}

  // Pública: solo vacantes activas, para que el buscador de empleos no
  // muestre las que un reclutador ya cerró.
  listarTodas() {
    return this.vacantes.find({ where: { estado: 'activa' }, order: { creadaEn: 'DESC' } });
  }

  listarDe(reclutadorId: string) {
    return this.vacantes.find({ where: { reclutadorId }, order: { creadaEn: 'DESC' } });
  }

  async obtenerUna(id: string) {
    const vacante = await this.vacantes.findOne({ where: { id } });
    if (!vacante) throw new NotFoundException('Esa vacante no existe.');
    return vacante;
  }

  crear(reclutadorId: string, dto: CrearVacanteDto) {
    const vacante = this.vacantes.create({ ...dto, reclutadorId });
    return this.vacantes.save(vacante);
  }

  async actualizar(id: string, reclutadorId: string, dto: ActualizarVacanteDto) {
    const vacante = await this.obtenerUna(id);
    this.verificarDueno(vacante, reclutadorId);
    Object.assign(vacante, dto);
    return this.vacantes.save(vacante);
  }

  async alternarEstado(id: string, reclutadorId: string) {
    const vacante = await this.obtenerUna(id);
    this.verificarDueno(vacante, reclutadorId);
    vacante.estado = vacante.estado === 'activa' ? 'cerrada' : 'activa';
    return this.vacantes.save(vacante);
  }

  async eliminar(id: string, reclutadorId: string) {
    const vacante = await this.obtenerUna(id);
    this.verificarDueno(vacante, reclutadorId);
    await this.vacantes.remove(vacante);
    return { eliminado: true };
  }

  // Que un reclutador solo pueda tocar SUS propias vacantes, aunque
  // adivine o vea el id de una ajena.
  private verificarDueno(vacante: VacanteEntity, reclutadorId: string) {
    if (vacante.reclutadorId !== reclutadorId) {
      throw new ForbiddenException('No puedes modificar una vacante que no es tuya.');
    }
  }
}
