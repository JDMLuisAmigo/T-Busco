import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

// Guardamos TODA la hoja de vida como un solo JSON (columna "datos"),
// con la misma forma que ya usa el frontend (src/data/cvModelo.js).
// Es la opción más simple mientras el CV cambia de estructura seguido;
// más adelante, si necesitas buscar/filtrar candidatos por experiencia,
// habilidades, etc., se puede pasar a tablas relacionadas.
@Entity('cv')
export class CvEntity {
  // Id de la persona dueña de este CV: es el mismo id que el token JWT
  // (usuario.id en el módulo auth). No hay relación @ManyToOne porque no
  // necesitamos hacer JOIN con la tabla usuarios por ahora; basta con guardar
  // el mismo id que ya identifica a la persona en el sistema de login.
  @PrimaryColumn()
  id: string;

  @Column({ type: 'jsonb', default: {} })
  datos: Record<string, any>;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
