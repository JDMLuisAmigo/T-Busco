import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { VacantesModule } from './vacantes/vacantes.module';
import { PostulacionesModule } from './postulaciones/postulaciones.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { CandidatosModule } from './candidatos/candidatos.module';
import { AdminModule } from './admin/admin.module';
import { IaModule } from './ia/ia.module';
import { CvModule } from './cv/cv.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // SOLO en desarrollo
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }),
    AuthModule,
    CvModule,
    VacantesModule,
    PostulacionesModule,
    NotificacionesModule,
    AdminModule,
    CandidatosModule,
    IaModule,
  ],
})
export class AppModule {}
