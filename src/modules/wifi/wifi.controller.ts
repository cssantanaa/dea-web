import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissao } from 'src/common/decorators/permissao.decorator';
import { Usuario } from 'src/common/decorators/usuario.decorator';
import { WifiService } from './wifi.service';
import { CriarWifiDto } from './dto/criar-wifi.dto';
import { AtualizarWifiDto } from './dto/atualizar-wifi.dto';
import { FiltrarWifiDto } from './dto/filtrar-wifi.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('estabelecimentos/:eid/wifi')
export class WifiController {
  constructor(private service: WifiService) {}

  @Post()
  @Permissao('configurar_redes_wifi')
  criarWifi(
    @Param('eid') eid: string,
    @Body() dto: CriarWifiDto,
    @Usuario() user: any,
  ) {
    return this.service.criarWifi(dto, eid, user.userId);
  }

  @Get()
  listarWifis(
    @Param('eid') eid: string,
    @Query() filtros: FiltrarWifiDto,
  ) {
    return this.service.listarWifis(eid, filtros);
  }

  @Get(':id')
  buscarWifiPorId(
    @Param('eid') eid: string,
    @Param('id') id: string,
  ) {
    return this.service.buscarWifiPorId(id, eid);
  }

  @Patch(':id')
  @Permissao('configurar_redes_wifi')
  atualizarWifi(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Body() dto: AtualizarWifiDto,
    @Usuario() user: any,
  ) {
    return this.service.atualizarWifi(id, dto, eid, user.userId);
  }

  @Patch(':id/alternar-status')
  @Permissao('configurar_redes_wifi')
  @HttpCode(200)
  alternarStatusWifi(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Body() body: { ativo: boolean },
    @Usuario() user: any,
  ) {
    return this.service.alternarStatusWifi(
      id,
      eid,
      body.ativo,
      user.userId,
    );
  }

  @Delete(':id')
  @Permissao('configurar_redes_wifi')
  @HttpCode(200)
  removerWifi(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Usuario() user: any,
  ) {
    return this.service.removerWifi(id, eid, user.userId);
  }
}