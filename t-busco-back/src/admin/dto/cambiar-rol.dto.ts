import { IsIn } from 'class-validator';

export class CambiarRolDto {
  @IsIn(['aspirante', 'reclutador', 'administrador', 'tecnico'], { message: 'Ese rol no es válido.' })
  rol: 'aspirante' | 'reclutador' | 'administrador';
}
