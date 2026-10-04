import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // El header "Origin" que manda el navegador NUNCA trae barra al final;
  // si FRONTEND_URL sí la tiene (por un espacio de más al pegarla en
  // Railway), nunca coincidiría y CORS rechazaría todo, aunque la URL
  // "se vea" igual a simple vista.
  const limpiar = (url?: string) => url?.replace(/\/+$/, '');
  const origenesPermitidos = [
    'http://localhost:3000',
    limpiar(process.env.FRONTEND_URL),
  ].filter((origen): origen is string => Boolean(origen));
  app.enableCors({ origin: origenesPermitidos });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
