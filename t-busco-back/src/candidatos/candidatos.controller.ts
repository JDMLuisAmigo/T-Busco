import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CandidatosService } from './candidatos.service';
import { InvitarCandidatoDto } from './dto/invitar-candidato.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('reclutador')
@Controller('candidatos')
export class CandidatosController {
  constructor(private readonly candidatosService: CandidatosService) {}

  @Get()
  buscar(@Query('q') q: string) {
    return this.candidatosService.buscar(q);
  }

  // Para que el frontend sepa, por vacante, a quién ya se invitó
  // (y así deshabilitar el botón o mostrar "Ya invitado").
  @Get('mis-invitaciones')
  misInvitaciones(@Req() req: any) {
    return this.candidatosService.misInvitaciones(req.user.id);
  }

  @Post('invitar')
  invitar(@Req() req: any, @Body() dto: InvitarCandidatoDto) {
    return this.candidatosService.invitar(req.user.id, dto.vacanteId, dto.aspiranteId);
  }
}
