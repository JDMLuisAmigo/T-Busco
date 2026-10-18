import { IsUUID } from 'class-validator';

export class InvitarCandidatoDto {
  @IsUUID('all', { message: 'El id de la vacante no es válido.' })
  vacanteId: string;

  @IsUUID('all', { message: 'El id del candidato no es válido.' })
  aspiranteId: string;
}
