import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

// Un reclutador no puede invitar dos veces al mismo candidato a la misma vacante
@Entity('invitaciones')
@Unique(['vacanteId', 'aspiranteId'])
export class InvitacionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vacanteId: string;

  @Column()
  reclutadorId: string;

  @Column()
  aspiranteId: string;

  @CreateDateColumn()
  creadaEn: Date;
}
