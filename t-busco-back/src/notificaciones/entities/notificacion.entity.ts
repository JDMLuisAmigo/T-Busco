import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notificaciones')
export class NotificacionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // A quién le llega (el id de usuario, sea aspirante o reclutador)
  @Column()
  usuarioId: string;

  @Column()
  mensaje: string;

  // A dónde lleva al hacer clic (opcional). Ej: '/postulaciones'
  @Column({ nullable: true })
  enlace: string;

  @Column({ default: false })
  leida: boolean;

  @CreateDateColumn()
  creadaEn: Date;
}
