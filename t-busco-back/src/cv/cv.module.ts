import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvEntity } from './entities/cv.entity';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { AuthModule } from '../auth/auth.module'; // trae registrada la estrategia "jwt" que usa el guard

@Module({
  imports: [TypeOrmModule.forFeature([CvEntity]), AuthModule],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
