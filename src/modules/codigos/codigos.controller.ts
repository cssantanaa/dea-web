import { Controller, Get, Post, Patch, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Criar novo código' })
  criar(
    @Param('estabelecimentoId') estabelecimentoId: string,
    @Body() dto: CriarCodigoDto,
    @Usuario() usuario: any,
  ) {
    return this.service.criar(dto, estabelecimentoId, usuario.userId);
  }

  @Post('confirmar-substituicao')
  @Permissao('gerar_codigos_qr')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirmar substituição de código ativo' })
  confirmarSubstituicao(
    @Param('estabelecimentoId') estabelecimentoId: string,
    @Body() dto: ConfirmarSubstituicaoDto,
    @Usuario() usuario: any,
  ) {
    return this.service.confirmarSubstituicao(
      dto,
      estabelecimentoId,
      usuario.userId,
    );
  }

  @Post('criar-revogado')
  @Permissao('gerar_codigos_qr')
  @HttpCode(201)
  @ApiOperation({
    summary:
      'Criar código já revogado (sem afetar o código ativo atual)',
  })
  criarRevogado(
    @Param('estabelecimentoId') estabelecimentoId: string,
    @Body() dto: CriarCodigoDto,
    @Usuario() usuario: any,
  ) {
    return this.service.criarComoRevogado(
      dto,
      estabelecimentoId,
      usuario.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar códigos do estabelecimento' })
  listar(@Param('estabelecimentoId') estabelecimentoId: string) {
    return this.service.listar(estabelecimentoId);
  }

  @Get(':id/qr')
  @ApiOperation({
    summary: 'Obter QR Code de um código ativo',
  })
  obterQrCode(
    @Param('estabelecimentoId') estabelecimentoId: string,
    @Param('id') id: string,
  ) {
    return this.service.obterQrCode(id, estabelecimentoId);
  }

  @Patch(':id/revogar')
  @Permissao('gerar_codigos_qr')
  @HttpCode(200)
  @ApiOperation({ summary: 'Revogar código ativo' })
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
  @ApiOperation({ summary: 'Reativar código' })
  reativar(
    @Param('estabelecimentoId') estabelecimentoId: string,
    @Param('id') id: string,
    @Usuario() usuario: any,
  ) {
    return this.service.reativar(id, estabelecimentoId, usuario.userId);
  }
}