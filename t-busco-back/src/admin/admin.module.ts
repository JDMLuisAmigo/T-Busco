import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Usuario } from '../auth/entities/usuario.entity';
import { VacanteEntity } from '../vacantes/entities/vacante.entity';
import { PostulacionEntity } from '../postulaciones/entities/postulacion.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, VacanteEntity, PostulacionEntity]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
