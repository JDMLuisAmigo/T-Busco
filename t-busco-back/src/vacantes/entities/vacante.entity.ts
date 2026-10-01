import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('vacantes')
export class VacanteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Id del usuario (con rol "reclutador") dueño de esta vacante.
  // No se usa @ManyToOne por simplicidad: basta con guardar el mismo
  // id que ya identifica a esa persona en la tabla "usuarios".
  @Column()
  reclutadorId: string;

  @Column()
  titulo: string;

  @Column()
  empresa: string;

  @Column({ nullable: true })
  sectorEmpresa: string;

  @Column({ nullable: true })
  empleados: string;

  @Column()
  categoria: string;

  @Column()
  ciudad: string;

  @Column()
  lugar: string; // Remoto | Híbrido | Presencial

  @Column()
  jornada: string; // Tiempo completo | Medio tiempo | Freelance

  @Column()
  contrato: string; // Indefinido | Temporal | Prestación de servicios

  @Column({ type: 'int' })
  salarioMin: number;

  @Column({ type: 'int' })
  salarioMax: number;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ nullable: true })
  lema: string;

  @Column({ type: 'text', nullable: true })
  sobreEmpresa: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'jsonb', default: [] })
  responsabilidades: string[];

  @Column({ type: 'jsonb', default: [] })
  requisitos: string[];

  @Column({ type: 'jsonb', default: [] })
  beneficios: string[];

  // 'activa' | 'cerrada'. Una vacante cerrada no debería salir en la
  // búsqueda pública (eso se filtra del lado del listado, ver vacantes.service.ts).
  @Column({ default: 'activa' })
  estado: string;

  @CreateDateColumn()
  creadaEn: Date;

  @UpdateDateColumn()
  actualizadaEn: Date;
}
