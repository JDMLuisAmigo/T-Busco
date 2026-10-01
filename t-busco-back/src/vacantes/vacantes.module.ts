import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacanteEntity } from './entities/vacante.entity';
import { VacantesService } from './vacantes.service';
import { VacantesController } from './vacantes.controller';
import { AuthModule } from '../auth/auth.module'; // trae la estrategia "jwt" que usa JwtAuthGuard

@Module({
  imports: [TypeOrmModule.forFeature([VacanteEntity]), AuthModule],
  controllers: [VacantesController],
  providers: [VacantesService],
})
export class VacantesModule {}
