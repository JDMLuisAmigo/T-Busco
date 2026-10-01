import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

// class-validator revisa esto automáticamente antes de que el código
// del controlador se ejecute (ver "ValidationPipe" en INSTALAR.md).
export class RegistroDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  nombre: string;

  @IsEmail({}, { message: 'Escribe un correo válido.' })
  correo: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  contrasena: string;

  // Por ahora solo se puede elegir aspirante o reclutador desde el registro público.
  // "administrador" se asigna directamente en la base de datos, nunca desde un formulario.
  @IsIn(['aspirante', 'reclutador'], { message: 'El rol debe ser aspirante o reclutador.' })
  rol: 'aspirante' | 'reclutador';
}
