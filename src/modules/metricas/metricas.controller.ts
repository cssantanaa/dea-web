import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permissao } from 'src/common/decorators/permissao.decorator';
import { Usuario } from 'src/common/decorators/usuario.decorator';
import { FiltrarMetricasDto } from './dto/filtrar-metricas.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { MetricasService } from './metricas.service';


@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('establishments/:eid/metrics')
export class MetricasController {
  constructor(private service: MetricasService) {}

  @Get()
  @Permissao('consultar_metricas')
  query(
    @Param('eid') eid: string,
    @Query() filtros: FiltrarMetricasDto,
    @Usuario() usuario: any,
  ) {
    return this.service.query(eid, filtros, usuario);
  }
}
