import { Controller, Get, Post, Patch, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissao } from 'src/common/decorators/permissao.decorator';
import { Usuario } from 'src/common/decorators/usuario.decorator';
import { CriarCodigoDto } from './dto/criar-codigo.dto';
import { ConfirmarSubstituicaoDto } from './dto/confirmar-substituicao.dto';
import { CodigosService } from './codigos.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('estabelecimentos/:estabelecimentoId/codigos')
export class CodigosController {
  constructor(private readonly service: CodigosService) {}

  @Post()
  @Permissao('gerar_codigos_qr')
  criarCodigo(
    @Param('estabelecimentoId') estabelecimentoId: string,
    @Body() dto: CriarCodigoDto,
    @Usuario() usuario: any,
  ) {
    return this.service.criarCodigo(dto, estabelecimentoId, usuario.userId);
  }

  @Post('confirmar-substituicao')
  @Permissao('gerar_codigos_qr')
  @HttpCode(200)
  confirmarSubstituicaoCodigo(
    @Param('estabelecimentoId') estabelecimentoId: string,
    @Body() dto: ConfirmarSubstituicaoDto,
    @Usuario() usuario: any,
  ) {
    return this.service.confirmarSubstituicaoCodigo(
      dto,
      estabelecimentoId,
      usuario.userId,
    );
  }

  @Post('criar-revogado')
  @Permissao('gerar_codigos_qr')
  @HttpCode(201)
  criarCodigoRevogado(
    @Param('estabelecimentoId') estabelecimentoId: string,
    @Body() dto: CriarCodigoDto,
    @Usuario() usuario: any,
  ) {
    return this.service.criarCodigoRevogado(
      dto,
      estabelecimentoId,
      usuario.userId,
    );
  }

  @Get()
  listar(@Param('estabelecimentoId') estabelecimentoId: string) {
    return this.service.listar(estabelecimentoId);
  }

  @Get(':id/qr')
  obterQrCode(
    @Param('estabelecimentoId') estabelecimentoId: string,
    @Param('id') id: string,
  ) {
    return this.service.obterQrCode(id, estabelecimentoId);
  }

  @Patch(':id/revogar')
  @Permissao('gerar_codigos_qr')
  @HttpCode(200)
  revogar(
    @Param('estabelecimentoId') estabelecimentoId: string,
    @Param('id') id: string,
    @Usuario() usuario: any,
  ) {
    return this.service.revogar(id, estabelecimentoId, usuario.userId);
  }

  @Patch(':id/reativar')
  @Permissao('gerar_codigos_qr')
  @HttpCode(200)
  reativar(
    @Param('estabelecimentoId') estabelecimentoId: string,
    @Param('id') id: string,
    @Usuario() usuario: any,
  ) {
    return this.service.reativar(id, estabelecimentoId, usuario.userId);
  }
}