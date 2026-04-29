// import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
// // import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// // import { PermissionsGuard } from '../../auth/guards/permissions.guard';
// // import { RequirePermission } from '../../common/decorators/permissions.decorator';
// // import { CurrentUser } from '../../common/decorators/current-user.decorator';
// // import { MetricsService } from './metrics.service';
// // import { MetricsFilterDto } from './dto/metrics-filter.dto';

// @ApiTags('RF025 - Métricas e Relatórios')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, PermissionsGuard)
// @Controller('establishments/:eid/metrics')
// export class MetricsController {
//   constructor(private service: MetricsService) {}

//   @Get()
//   @RequirePermission('consultar_metricas')
//   @ApiOperation({
//     summary: 'Consultar métricas operacionais do estabelecimento',
//     description:
//       'Retorna indicadores como total de acessos, ocorrências, tempos médios, ' +
//       'distribuição por tipo de destino, disponibilidade de POIs e barreiras ativas.',
//   })
//   query(
//     @Param('eid') eid: string,
//     @Query() filters: MetricsFilterDto,
//     @CurrentUser() user: any,
//   ) {
//     return this.service.query(eid, filters, user);
//   }
// }
