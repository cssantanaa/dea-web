import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissao } from 'src/common/decorators/permissao.decorator';
import { Usuario } from 'src/common/decorators/usuario.decorator';
import { PoisService } from './pois.service';
import { CriarPoiDto } from './dto/criar-poi.dto';
import { AtualizarPoiDto, filtrarPoiDto } from './dto/atualizar-poi.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('estabelecimentos/:eid/pois')
export class PoisController {
  constructor(private service: PoisService) {}

  @Post()
  @Permissao('gerenciar_pois')
  criar(
    @Param('eid') eid: string,
    @Body() dto: CriarPoiDto,
    @Usuario() user: any,
  ) {
    return this.service.criarPois(dto, eid, user.userId);
  }

  @Get()
  listar(@Param('eid') eid: string, @Query() filtros: filtrarPoiDto) {
    return this.service.listarPois(eid, filtros);
  }

  @Get(':id')
  buscarPorId(@Param('eid') eid: string, @Param('id') id: string) {
    return this.service.buscarPoisPorId(id, eid);
  }

  @Patch(':id')
  @Permissao('gerenciar_pois')
  atualizar(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Body() dto: AtualizarPoiDto,
    @Usuario() user: any,
  ) {
    return this.service.atualizarPois(id, dto, eid, user.userId);
  }

  @Delete(':id')
  @Permissao('gerenciar_pois')
  @HttpCode(200)
  remover(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Usuario() user: any,
  ) {
    return this.service.removerPois(id, eid, user.userId);
  }
}