import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type Rol = 'aspirante' | 'reclutador' | 'administrador';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  // NUNCA se guarda la contraseña tal cual, solo su hash (ver auth.service.ts)
  @Column()
  contrasenaHash: string;

  @Column({ type: 'varchar', default: 'aspirante' })
  rol: Rol;

  @CreateDateColumn()
  creadoEn: Date;
}
