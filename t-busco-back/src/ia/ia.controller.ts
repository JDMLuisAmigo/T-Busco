import { BadRequestException, Controller, ForbiddenException, Get, NotFoundException, Query, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IaService } from './ia.service';
import { CvEntity } from '../cv/entities/cv.entity';
import { VacanteEntity } from '../vacantes/entities/vacante.entity';
import { CandidatosService } from '../candidatos/candidatos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ia')
export class IaController {
  constructor(
    private readonly iaService: IaService,
    @InjectRepository(CvEntity) private readonly cvs: Repository<CvEntity>,
    @InjectRepository(VacanteEntity) private readonly vacantes: Repository<VacanteEntity>,
    private readonly candidatosService: CandidatosService,
  ) {}

  @Roles('aspirante')
  @Get('vacantes-recomendadas')
  async vacantesRecomendadas(@Req() req: any) {
    const cv = await this.cvs.findOne({ where: { id: req.user.id } });
    if (!cv?.datos?.nombre) {
      throw new BadRequestException('Completa y guarda tu hoja de vida para recibir recomendaciones.');
    }

    const activas = await this.vacantes.find({ where: { estado: 'activa' } });
    const sugerencias = await this.iaService.recomendarVacantes(cv.datos, activas);

    const porId = new Map(activas.map((v) => [v.id, v]));
    return sugerencias
      .map((s) => {
        const vacante = porId.get(s.id);
        return vacante ? { ...vacante, razon: s.razon } : null;
      })
      .filter(Boolean);
  }

  @Roles('reclutador')
  @Get('candidatos-sugeridos')
  async candidatosSugeridos(@Req() req: any, @Query('vacanteId') vacanteId: string) {
    const vacante = await this.vacantes.findOne({ where: { id: vacanteId } });
    if (!vacante) throw new NotFoundException('Esa vacante no existe.');
    if (vacante.reclutadorId !== req.user.id) {
      throw new ForbiddenException('No puedes pedir sugerencias para una vacante que no es tuya.');
    }

    const candidatos = await this.candidatosService.buscar('');
    const sugerencias = await this.iaService.sugerirCandidatos(vacante, candidatos);

    const porId = new Map(candidatos.map((c) => [c.aspiranteId, c]));
    return sugerencias
      .map((s) => {
        const candidato = porId.get(s.id);
        return candidato ? { ...candidato, razon: s.razon } : null;
      })
      .filter(Boolean);
  }
}
