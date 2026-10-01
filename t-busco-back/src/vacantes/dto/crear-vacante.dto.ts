import { IsArray, IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CrearVacanteDto {
  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  titulo: string;

  @IsString()
  @MinLength(2, { message: 'El nombre de la empresa debe tener al menos 2 caracteres.' })
  empresa: string;

  @IsOptional() @IsString()
  sectorEmpresa?: string;

  @IsOptional() @IsString()
  empleados?: string;

  @IsString()
  categoria: string;

  @IsString()
  ciudad: string;

  @IsIn(['Remoto', 'Híbrido', 'Presencial'], { message: 'La modalidad debe ser Remoto, Híbrido o Presencial.' })
  lugar: string;

  @IsIn(['Tiempo completo', 'Medio tiempo', 'Freelance'], { message: 'La jornada no es válida.' })
  jornada: string;

  @IsIn(['Indefinido', 'Temporal', 'Prestación de servicios'], { message: 'El tipo de contrato no es válido.' })
  contrato: string;

  @IsInt() @Min(0, { message: 'El salario no puede ser negativo.' })
  salarioMin: number;

  @IsInt() @Min(0, { message: 'El salario no puede ser negativo.' })
  salarioMax: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @IsOptional() @IsString()
  lema?: string;

  @IsOptional() @IsString()
  sobreEmpresa?: string;

  @IsString()
  @MinLength(10, { message: 'Escribe una descripción un poco más detallada.' })
  descripcion: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  responsabilidades?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  requisitos?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  beneficios?: string[];
}
