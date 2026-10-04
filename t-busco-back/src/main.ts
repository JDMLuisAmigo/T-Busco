import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Acepta peticiones de tu máquina local Y del dominio real una vez
  // que despliegues el frontend (FRONTEND_URL se configura en Railway).
  const origenesPermitidos = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter((origen): origen is string => Boolean(origen));
  app.enableCors({ origin: origenesPermitidos });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
