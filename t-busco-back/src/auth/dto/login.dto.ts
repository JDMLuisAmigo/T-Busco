import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Escribe un correo válido.' })
  correo: string;

  @IsString()
  contrasena: string;
}
