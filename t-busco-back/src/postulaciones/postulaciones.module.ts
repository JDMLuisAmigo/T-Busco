import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostulacionEntity } from './entities/postulacion.entity';
import { PostulacionesService } from './postulaciones.service';
import { PostulacionesController } from './postulaciones.controller';
import { VacanteEntity } from '../vacantes/entities/vacante.entity';
import { CvEntity } from '../cv/entities/cv.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostulacionEntity, VacanteEntity, CvEntity]),
    AuthModule,
    NotificacionesModule,
  ],
  controllers: [PostulacionesController],
  providers: [PostulacionesService],
})
export class PostulacionesModule {}
