import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissao } from 'src/common/decorators/permissao.decorator';
import { Usuario } from 'src/common/decorators/usuario.decorator';
import { PoisService } from './pois.service';
import { CriarPoiDto } from './dto/criar-poi.dto';
import { AtualizarPoiDto, filtrarPoiDto } from './dto/atualizar-poi.dto';


@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('estabelecimentos/:eid/pois')
export class PoisController {
  constructor(private service: PoisService) {}

  @Post()
  criar(
    @Param('eid') eid: string,
    @Body() dto: CriarPoiDto,
    @Usuario() user: any,
  ) {
    return this.service.criar(dto, eid, user.userId);
  }

  @Get()
  findAll(@Param('eid') eid: string, @Query() filtros: filtrarPoiDto) {
    return this.service.findAll(eid, filtros);
  }

  @Get(':id')
  findOne(@Param('eid') eid: string, @Param('id') id: string) {
    return this.service.findOne(id, eid);
  }

  @Patch(':id')
  atualizar(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Body() dto: AtualizarPoiDto,
    @Usuario() user: any,
  ) {
    return this.service.atualizar(id, dto, eid, user.userId);
  }

  @Delete(':id')
  @HttpCode(200)
  remover(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Usuario() user: any,
  ) {
    return this.service.remover(id, eid, user.userId);
  }
}