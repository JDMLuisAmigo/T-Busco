import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ActualizarPostulacionDto {
  @IsOptional()
  @IsIn(['enviada', 'entrevista', 'aceptada', 'rechazada'], { message: 'Ese estado no es válido.' })
  estado?: string;

  @IsOptional()
  @IsInt() @Min(0) @Max(100, { message: 'El puntaje va de 0 a 100.' })
  puntaje?: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}
