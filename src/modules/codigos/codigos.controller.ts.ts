import { Controller, Get, Post, Patch, Body, Param, UseGuards,HttpCode } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissao } from 'src/common/decorators/permissao.decorator';
import { Usuario } from 'src/common/decorators/usuario.decorator';
import { CodigoService } from './codigos.service';
import { CriarCodigoDto } from './dto/criar-codigo.dto';
import { ConfirmarSubstituicaoDto } from './dto/confirmar-substituicao.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('establishments/:eid/codes')
export class CodigoController {
  constructor(private service: CodigoService) {}

  @Post()
  @Permissao('gerar_codigos_qr')
  create(
    @Param('eid') eid: string,
    @Body() dto: CriarCodigoDto,
    @Usuario() user: any,
  ) {
    return this.service.create(dto, eid, user.userId);
  }

  @Post('confirm-replace')
  @Permissao('gerar_codigos_qr')
  @HttpCode(200)
  confirmReplace(
    @Param('eid') eid: string,
    @Body() dto: ConfirmarSubstituicaoDto,
    @Usuario() user: any,
  ) {
    return this.service.confirmarSubstituicao(dto, eid, user.userId);
  }

  @Post('create-as-revoked')
  @Permissao('gerar_codigos_qr')
  @HttpCode(201)
  @ApiOperation({ summary: 'Criar código como revogado (sem substituir o código ativo atual)' })
  createAsRevoked(
    @Param('eid') eid: string,
    @Body() dto: CriarCodigoDto,
    @Usuario() user: any,
  ) {
    return this.service.createAsRevoked(dto, eid, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os códigos do estabelecimento' })
  findAll(@Param('eid') eid: string) {
    return this.service.findAll(eid);
  }

  @Get(':id/qr')
  @ApiOperation({ summary: 'Obter dados do QR Code (somente para código ativo)' })
  getQrData(@Param('eid') eid: string, @Param('id') id: string) {
    return this.service.getQrData(id, eid);
  }

  @Patch(':id/revoke')
  @Permissao('gerar_codigos_qr')
  @HttpCode(200)
  @ApiOperation({ summary: 'Revogar código ativo' })
  revoke(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Usuario() user: any,
  ) {
    return this.service.revoke(id, eid, user.userId);
  }

  @Patch(':id/reactivate')
  @Permissao('gerar_codigos_qr')
  @HttpCode(200)
  reactivate(
    @Param('eid') eid: string,
    @Param('id') id: string,
    @Usuario() user: any,
  ) {
    return this.service.reactivate(id, eid, user.userId);
  }
}
