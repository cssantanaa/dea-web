import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Usuario } from 'src/common/decorators/usuario.decorator';
import { TipoUsuario } from 'src/common/decorators/tipos.decorator';
import { EstabelecimentosService } from './estabelecimentos.service';
import { CriarEstabelecimentoDto } from './dto/criar-estabelecimentos.dto';
import { AtualizarEstabelecimentoDto } from './dto/atualizar-estabelecimento.dto';
import { FiltrarEstabelecimentoDto } from './dto/filtrar-estabelecimento.dto';
import { StatusEstabelecimento } from '@prisma/client';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TipoUsuario(['super_admin']))
@TipoUsuario(['super_admin'])
@Controller('estabelecimentos')
export class EstabelecimentosController {
  constructor(private service: EstabelecimentosService) {}

  @Post()
  criarEstabelecimento(@Body() dto: CriarEstabelecimentoDto, @Usuario() user: any) {
    return this.service.criarEstabelecimento(dto, user.userId);
  }

  @Get()
  listarEstabelecimentos(@Query() filters: FiltrarEstabelecimentoDto) {
    return this.service.listarEstabelecimentos(filters);
  }

  @Get(':id')
  buscarEstabelecimentoPorId(@Param('id') id: string) {
    return this.service.buscarEstabelecimentoPorId(id);
  }

  @Patch(':id')
  atualizarEstabelecimento(
    @Param('id') id: string,
    @Body() dto: AtualizarEstabelecimentoDto,
    @Usuario() user: any,
  ) {
    return this.service.atualizarEstabelecimento(id, dto, user.userId);
  }

  @Patch(':id/status')
  @HttpCode(200)
  alterarStatusEstabelecimento(
    @Param('id') id: string,
    @Body() dto: StatusEstabelecimento,
    @Usuario() user: any,
  ) {
    return this.service.alterarStatusEstabelecimento(id, dto, user.userId);
  }
}