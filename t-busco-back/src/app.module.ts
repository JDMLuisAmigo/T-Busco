import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { VacantesModule } from './vacantes/vacantes.module';
import { CvModule } from './cv/cv.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // SOLO en desarrollo
    }),
    AuthModule,
    CvModule,
    VacantesModule,
  ],
})
export class AppModule {}
