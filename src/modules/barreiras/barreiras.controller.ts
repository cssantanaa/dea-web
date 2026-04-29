import {Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissao } from 'src/common/decorators/permissao.decorator';
import { Usuario } from 'src/common/decorators/usuario.decorator';
import { BarreiraService } from './barreiras.service';
import { CriarBarreiraDto } from './dto/criar-barreira.dto';
import { AtualizarBarreiraDto } from './dto/atualizar-barreira.dto';
import { FiltrarBarreiraDto } from './dto/filtrar-barreira.dto';
import { AlterarStatusBarreiraDto } from './dto/alternar-status-barreira.dto';


@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('estabelecimentos/:eid/barreiras')
export class BarreiraController {
  constructor(private service: BarreiraService) {}

  @Post()
  @Permissao('gerenciar_barreiras')
  create(
    @Param('eid') eid: string,
    @Body() dto: CriarBarreiraDto,
    @Usuario() user: any,
  ) {
    return this.service.create(dto, eid, user.userId);
  }

  @Get()
  findAll(@Param('eid') eid: string, @Query() filters: FiltrarBarreiraDto) {
    return this.service.findAll(eid, filters);
  }

  @Get('ativos')
  findActive(@Param('eid') eid: string) {
    return this.service.findActive(eid);
  }

  @Get(':id')
  findOne(@Param('eid') eid: string, @Param('id') id: string) {
    return this.service.findOne(id, eid);
  }

  @Patch(':id')
  @Permissao('gerenciar_barreiras')
  update(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Body() dto: AtualizarBarreiraDto,
    @Usuario() user: any,
  ) {
    return this.service.update(id, dto, eid, user.userId);
  }

  @Patch(':id/alternar-status')
  @Permissao('gerenciar_barreiras')
  @HttpCode(200)  
  alternarStatus(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Body() dto: AlterarStatusBarreiraDto,
    @Usuario() user: any,
  ) {
    return this.service.alternarStatus(id, eid, dto.ativo, user.userId);
  }

  @Patch(':id/close')
  @Permissao('gerenciar_barreiras')
  @HttpCode(200)
  closeBarrier(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Usuario() user: any,
  ) {
    return this.service.closeBarrier(id, eid, user.userId);
  }
}
