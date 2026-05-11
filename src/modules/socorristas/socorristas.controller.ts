import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissao } from 'src/common/decorators/permissao.decorator';
import { Usuario } from 'src/common/decorators/usuario.decorator';
import { SocorristasService } from './socorristas.service';
import { CriarSocorristaDto } from './dto/criar-socorristas.dto';
import { AtualizarSocorristaDto } from './dto/atualizar-socorristas.dto';
import { FiltrarSocorristasDto } from './dto/filtrar-socorristas.dto';
import { AlternarAtivoDto } from '../administrador/dto/alternar-ativo.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('estabelecimentos/:eid/socorristas')
export class SocorristasController {
  constructor(private service: SocorristasService) {}

  @Post()
  @Permissao('gerenciar_socorristas')
  criarSocorrista(
    @Param('eid') eid: string,
    @Body() dto: CriarSocorristaDto,
    @Usuario() user: any,
  ) {
    return this.service.criarSocorrista(dto, eid, user.userId);
  }

  @Get()
  listarSocorristas(
    @Param('eid') eid: string,
    @Query() filtros: FiltrarSocorristasDto,
  ) {
    return this.service.listarSocorristas(eid, filtros);
  }

  @Get(':id')
  buscarSocorristaPorId(
    @Param('eid') eid: string,
    @Param('id') id: string,
  ) {
    return this.service.buscarSocorristaPorId(id, eid);
  }

  @Patch(':id')
  @Permissao('gerenciar_socorristas')
  atualizarSocorrista(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Body() dto: AtualizarSocorristaDto,
    @Usuario() user: any,
  ) {
    return this.service.atualizarSocorrista(id, dto, eid, user.userId);
  }

  @Delete(':id')
  @Permissao('gerenciar_socorristas')
  @HttpCode(200)
  removerSocorrista(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Usuario() user: any,
  ) {
    return this.service.removerSocorrista(id, eid, user.userId);
  }

  @Post(':id/resetar-senha')
  @Permissao('gerenciar_socorristas')
  @HttpCode(200)
  resetarSenhaSocorrista(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Usuario() user: any,
  ) {
    return this.service.resetarSenhaSocorrista(id, eid, user.userId);
  }

  @Patch(':id/alternar-ativo')
  @Permissao('gerenciar_socorristas')
  @HttpCode(200)
  alternarAtivoSocorrista(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Body() dto: AlternarAtivoDto,
    @Usuario() user: any,
  ) {
    return this.service.alternarAtivoSocorrista(id, eid, dto.ativo, user.userId);
  }
}