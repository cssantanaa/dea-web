import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TipoUsuarioGuard } from 'src/auth/guards/tipo-usuario.guard';
import { TipoUsuario } from 'src/common/decorators/tipos.decorator';
import { Usuario } from 'src/common/decorators/usuario.decorator';
import { AdminsService } from './administrador.service';
import { CriarAdministradorDto } from './dto/criar-administrador.dto';
import { AtualizarAdministradorDto } from './dto/atualizar-administrador.dto';
import { AlternarAtivoDto } from './dto/alternar-ativo.dto';
import { FiltrarAdminDto } from './dto/filtrar-admin.dto';

@UseGuards(JwtAuthGuard, TipoUsuarioGuard)
@TipoUsuario(['super_admin'])
@Controller('admins')
export class AdminsController {
  constructor(private service: AdminsService) {}

  @Post()
  create(@Body() dto: CriarAdministradorDto, @Usuario() user: any) {
    return this.service.create(dto, user.userId);
  }

  @Get()
  findAll(
    @Query('estabelecimentoId') estabelecimentoId: string,
    @Query() filtros: FiltrarAdminDto,
  ) {
    return this.service.findAll(estabelecimentoId, filtros);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: AtualizarAdministradorDto,
    @Usuario() user: any,
  ) {
    return this.service.update(id, dto, user.userId);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string, @Usuario() user: any) {
    return this.service.remove(id, user.userId);
  }

  @Post(':id/reset-password')
  @HttpCode(200)
  resetPassword(@Param('id') id: string, @Usuario() user: any) {
    return this.service.resetPassword(id, user.userId);
  }

  @Patch(':id/toggle-active')
  @HttpCode(200)
  toggleActive(
    @Param('id') id: string,
    @Body() dto: AlternarAtivoDto,
    @Usuario() user: any,
  ) {
    return this.service.toggleActive(id, dto.ativo, user.userId);
  }
}