import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Usuario } from 'src/common/decorators/usuario.decorator';
import { TipoUsuario } from 'src/common/decorators/tipos.decorator';
import { EstabelecimentoService } from './estabelecimentos.service';
import { CriarEstabelecimentoDto } from './dto/criar-estabelecimentos.dto';
import { AtualizarEstabelecimentoDto } from './dto/atualizar-estabelecimento.dto';
import { FiltrarEstabelecimentoDto } from './dto/filtrar-estabelecimento.dto';
import { StatusEstabelecimento } from '@prisma/client';


@UseGuards(JwtAuthGuard, TipoUsuario(['super_admin']))
@TipoUsuario(['super_admin'])
@Controller('estabelecimentos')
export class EstabelecimentosController {
  constructor(private service: EstabelecimentoService) {}

  @Post()
  create(@Body() dto: CriarEstabelecimentoDto, @Usuario() user: any) {
    return this.service.create(dto, user.userId);
  }

  @Get()
  findAll(@Query() filters: FiltrarEstabelecimentoDto) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: AtualizarEstabelecimentoDto,
    @Usuario() user: any,
  ) {
    return this.service.update(id, dto, user.userId);
  }

  @Patch(':id/status')
  @HttpCode(200)
  setStatus(
    @Param('id') id: string,
    @Body() dto: StatusEstabelecimento,
    @Usuario() user: any,
  ) {
    return this.service.setStatus(id, dto, user.userId);
  }
}