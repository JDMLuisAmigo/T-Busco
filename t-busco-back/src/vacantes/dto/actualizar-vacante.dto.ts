import { PartialType } from '@nestjs/mapped-types';
import { CrearVacanteDto } from './crear-vacante.dto';

// PartialType hace que TODOS los campos de CrearVacanteDto sean opcionales:
// así se puede editar solo el salario, por ejemplo, sin reenviar todo lo demás.
export class ActualizarVacanteDto extends PartialType(CrearVacanteDto) {}
