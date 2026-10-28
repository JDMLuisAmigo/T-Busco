import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IaService } from './ia.service';
import { IaController } from './ia.controller';
import { CvEntity } from '../cv/entities/cv.entity';
import { VacanteEntity } from '../vacantes/entities/vacante.entity';
import { AuthModule } from '../auth/auth.module';
import { CandidatosModule } from '../candidatos/candidatos.module';

@Module({
  imports: [TypeOrmModule.forFeature([CvEntity, VacanteEntity]), AuthModule, CandidatosModule],
  controllers: [IaController],
  providers: [IaService],
})
export class IaModule {}
