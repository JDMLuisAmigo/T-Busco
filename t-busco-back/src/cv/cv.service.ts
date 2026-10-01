import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvEntity } from './entities/cv.entity';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(CvEntity)
    private readonly repositorio: Repository<CvEntity>,
  ) {}

  // Devuelve el CV guardado, o null si esta persona todavía no ha guardado nada
  async obtener(id: string): Promise<Record<string, any> | null> {
    const registro = await this.repositorio.findOne({ where: { id } });
    return registro?.datos ?? null;
  }

  // Crea o reemplaza el CV completo (upsert: inserta si no existe, actualiza si ya existe)
  async guardar(id: string, datos: Record<string, any>): Promise<Record<string, any>> {
    await this.repositorio.upsert({ id, datos }, ['id']);
    return datos;
  }
}
