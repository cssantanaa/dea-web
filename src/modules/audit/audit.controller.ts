// import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';
// import { AuditService } from './audit.service';
// import { AuditQueryDto } from './dto/audit-query.dto';

// @ApiTags('RF027 - Histórico e Auditoria')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
// @Controller('audit')
// export class AuditController {
//   constructor(private service: AuditService) {}

//   @Get()
//   @ApiOperation({
//     summary: 'Consultar trilha de auditoria com filtros',
//     description:
//       'super_admin vê todos os estabelecimentos. ' +
//       'admin vê apenas o próprio e precisa da permissão consultar_historico. ' +
//       'Registros são somente leitura e imutáveis.',
//   })
//   query(
//     @Query() filters: AuditQueryDto,
//     @CurrentUser() user: any,
//     @Query('establishmentId') establishmentId?: string,
//   ) {
//     return this.service.query(filters, user, establishmentId);
//   }

//   @Get(':id')
//   @ApiOperation({ summary: 'Buscar detalhes de um registro de auditoria (inclui metadata)' })
//   findOne(@Param('id') id: string, @CurrentUser() user: any) {
//     return this.service.findOne(id, user);
//   }
// }
