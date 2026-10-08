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

  // NUNCA se guarda la contraseña tal cual, solo su hash
  @Column()
  contrasenaHash: string;

  @Column({ type: 'varchar', default: 'aspirante' })
  rol: Rol;

  // Un administrador puede desactivar una cuenta sin borrarla: conserva
  // su historial (vacantes publicadas, postulaciones hechas, etc.) pero
  // ya no puede iniciar sesión.
  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creadoEn: Date;
}
