import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissao } from 'src/common/decorators/permissao.decorator';
import { Usuario } from 'src/common/decorators/usuario.decorator';
import { SocorristasService } from './socorristas.service';
import { CriarSocorristaDto } from './dto/criar-socorristas.dto';
import { AtualizarSocorristaDto } from './dto/atualizar-socorristas.dto';
import { FiltrarSocorristasDto } from './dto/filtrar-socorristas.dto';
import { AlternarAtivoDto } from '../administrador/dto/alternar-ativo.dto';


@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('estabelecimentos/:eid/socorristas')
export class SocorristasController {
  constructor(private service: SocorristasService) {}

  @Post()
  criar(
    @Param('eid') eid: string,
    @Body() dto: CriarSocorristaDto,
    @Usuario() user: any,
  ) {
    return this.service.criar(dto, eid, user.userId);
  }

  @Get()
  findAll(@Param('eid') eid: string, @Query() filtros: FiltrarSocorristasDto) {
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
    @Body() dto: AtualizarSocorristaDto,
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

  @Post(':id/resetar-senha')
  @HttpCode(200)
  resetPassword(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Usuario() user: any,
  ) {
    return this.service.resetarSenha(id, eid, user.userId);
  }

  @Patch(':id/alternar-ativo')
  @HttpCode(200)
  toggleActive(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Body() dto: AlternarAtivoDto,
    @Usuario() user: any,
  ) {
    return this.service.alternarAtivo(id, eid, dto.ativo, user.userId);
  }
}
