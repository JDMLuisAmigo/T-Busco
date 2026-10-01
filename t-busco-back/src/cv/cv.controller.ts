import {
  Controller, Get, Put, Post, Body, Req,
  UploadedFile, UseInterceptors, UseGuards, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CvService } from './cv.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Tipos de archivo permitidos y peso máximo.
// OJO: esto es lo que de verdad protege al servidor; la validación que ya
// existe en el frontend (AdjuntoArchivo.js) es solo para dar mejor experiencia,
// cualquiera puede saltársela llamando a la API directamente.
const TIPOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
const PESO_MAXIMO = 5 * 1024 * 1024; // 5 MB

const almacenamiento = diskStorage({
  destination: './uploads/cv',
  filename: (_req, archivo, cb) => {
    const sufijo = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${sufijo}${extname(archivo.originalname)}`);
  },
});

// Todas las rutas de aquí abajo exigen un token válido (Authorization: Bearer ...).
// Ya NO reciben el id por la URL: siempre se usa req.user.id, que sale del
// token de quien hizo la petición. Así nadie puede leer o modificar el CV
// de otra persona con solo cambiar un id en la URL.
@UseGuards(JwtAuthGuard)
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Get()
  async obtener(@Req() req: any) {
    const datos = await this.cvService.obtener(req.user.id);
    return datos ?? {};
  }

  @Put()
  async guardar(@Req() req: any, @Body() datos: Record<string, any>) {
    return this.cvService.guardar(req.user.id, datos);
  }

  @Post('archivos')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: almacenamiento,
      limits: { fileSize: PESO_MAXIMO },
      fileFilter: (_req, archivo, cb) => {
        if (!TIPOS_PERMITIDOS.includes(archivo.mimetype)) {
          return cb(new BadRequestException('Formato no permitido. Usa PDF, JPG o PNG.'), false);
        }
        cb(null, true);
      },
    }),
  )
  subirArchivo(@UploadedFile() archivo: Express.Multer.File) {
    if (!archivo) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }
    return {
      nombre: archivo.originalname,
      tamano: archivo.size,
      tipo: archivo.mimetype,
      url: `/uploads/cv/${archivo.filename}`,
    };
  }
}
