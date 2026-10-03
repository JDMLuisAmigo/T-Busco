import { IsUUID } from 'class-validator';

export class CrearPostulacionDto {
  @IsUUID('all', { message: 'El id de la vacante no es válido.' })
  vacanteId: string;
}
