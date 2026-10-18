import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatosService } from './candidatos.service';
import { CandidatosController } from './candidatos.controller';
import { InvitacionEntity } from './entities/invitacion.entity';
import { CvEntity } from '../cv/entities/cv.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { VacanteEntity } from '../vacantes/entities/vacante.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvitacionEntity, CvEntity, Usuario, VacanteEntity]),
    AuthModule,
    NotificacionesModule,
  ],
  controllers: [CandidatosController],
  providers: [CandidatosService],
})
export class CandidatosModule {}
