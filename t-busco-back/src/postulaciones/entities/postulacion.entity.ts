import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

// Un aspirante no puede postularse dos veces a la misma vacante
@Entity('postulaciones')
@Unique(['vacanteId', 'aspiranteId'])
export class PostulacionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vacanteId: string;

  @Column()
  aspiranteId: string;

  // Copiados al momento de postularse (no se leen "en vivo" de la vacante):
  // así, si el reclutador edita o incluso borra la vacante después, la
  // postulación conserva de qué se trataba cuando el aspirante aplicó.
  @Column()
  vacanteTitulo: string;

  @Column()
  vacanteEmpresa: string;

  // Una copia completa de la hoja de vida en el momento de postularse,
  // con la misma forma que ya usa el frontend (data/cvModelo.js). Por la
  // misma razón que lo anterior: si el aspirante luego edita su CV, esta
  // postulación sigue mostrando lo que el reclutador realmente evaluó.
  @Column({ type: 'jsonb' })
  cvSnapshot: Record<string, any>;

  // 'enviada' | 'entrevista' | 'aceptada' | 'rechazada'
  @Column({ default: 'enviada' })
  estado: string;

  @Column({ type: 'int', nullable: true })
  puntaje: number | null;

  @Column({ type: 'text', nullable: true })
  comentario: string | null;

  @CreateDateColumn()
  creadaEn: Date;

  @UpdateDateColumn()
  actualizadaEn: Date;
}
