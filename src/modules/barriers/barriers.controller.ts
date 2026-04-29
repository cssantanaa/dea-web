// import {
//   Controller,
//   Get,
//   Post,
//   Patch,
//   Body,
//   Param,
//   Query,
//   UseGuards,
//   HttpCode,
// } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { PermissionsGuard } from '../../auth/guards/permissions.guard';
// import { RequirePermission } from '../../common/decorators/permissions.decorator';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';
// import { BarriersService } from './barriers.service';
// import {
//   CreateBarrierDto,
//   UpdateBarrierDto,
//   ToggleBarrierDto,
//   FilterBarrierDto,
// } from './dto/barrier.dto';

// @ApiTags('RF026 - Barreiras Temporárias')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, PermissionsGuard)
// @Controller('establishments/:eid/barriers')
// export class BarriersController {
//   constructor(private service: BarriersService) {}

//   @Post()
//   @RequirePermission('gerenciar_barreiras')
//   @ApiOperation({ summary: 'Cadastrar barreira/aviso temporário no mapa' })
//   create(
//     @Param('eid') eid: string,
//     @Body() dto: CreateBarrierDto,
//     @CurrentUser() user: any,
//   ) {
//     return this.service.create(dto, eid, user.userId);
//   }

//   @Get()
//   @ApiOperation({ summary: 'Listar barreiras com filtros opcionais' })
//   findAll(@Param('eid') eid: string, @Query() filters: FilterBarrierDto) {
//     return this.service.findAll(eid, filters);
//   }

//   @Get('active')
//   @ApiOperation({ summary: 'Listar apenas barreiras ativas (usadas pelo app para recalcular rotas)' })
//   findActive(@Param('eid') eid: string) {
//     return this.service.findActive(eid);
//   }

//   @Get(':id')
//   @ApiOperation({ summary: 'Buscar barreira por ID' })
//   findOne(@Param('eid') eid: string, @Param('id') id: string) {
//     return this.service.findOne(id, eid);
//   }

//   @Patch(':id')
//   @RequirePermission('gerenciar_barreiras')
//   @ApiOperation({ summary: 'Editar barreira (bloqueado para encerradas)' })
//   update(
//     @Param('eid') eid: string,
//     @Param('id') id: string,
//     @Body() dto: UpdateBarrierDto,
//     @CurrentUser() user: any,
//   ) {
//     return this.service.update(id, dto, eid, user.userId);
//   }

//   @Patch(':id/toggle-status')
//   @RequirePermission('gerenciar_barreiras')
//   @HttpCode(200)
//   @ApiOperation({ summary: 'Ativar ou inativar barreira manualmente' })
//   toggleStatus(
//     @Param('eid') eid: string,
//     @Param('id') id: string,
//     @Body() dto: ToggleBarrierDto,
//     @CurrentUser() user: any,
//   ) {
//     return this.service.toggleStatus(id, eid, dto.isActive, user.userId);
//   }

//   @Patch(':id/close')
//   @RequirePermission('gerenciar_barreiras')
//   @HttpCode(200)
//   @ApiOperation({ summary: 'Encerrar barreira (estado final — não pode ser editada depois)' })
//   closeBarrier(
//     @Param('eid') eid: string,
//     @Param('id') id: string,
//     @CurrentUser() user: any,
//   ) {
//     return this.service.closeBarrier(id, eid, user.userId);
//   }
// }
