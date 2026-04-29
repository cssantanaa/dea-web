import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { PrismaService } from 'prisma/prisma.service';
import { CriarCodigoDto } from './dto/criar-codigo.dto';
import { ConfirmarSubstituicaoDto } from './dto/confirmar-substituicao.dto';
import { ModoGeracao, StatusCodigo } from '@prisma/client';


@Injectable()
export class CodigoService {
  constructor(
    private prisma: PrismaService,
    // private audit: AuditService,
  ) {}

  async create(dto: CriarCodigoDto, estabelecimentoId: string, criadoPor: string) {
    if (dto.validoDe && dto.validoAte) {
      if (new Date(dto.validoAte) <= new Date(dto.validoDe)) {
        throw new BadRequestException('A data final deve ser posterior à data inicial.');
      }
    }

    let codigo: string;
    if (dto.modoGeracao === 'manual') {
      if (!dto.codigo) {
        throw new BadRequestException('Informe o valor do código no modo manual.');
      }
      const dup = await this.prisma.codigoAcesso.findUnique({
        where: {
          estabelecimentoId_codigo: { estabelecimentoId, codigo: dto.codigo },
        },
      });
      if (dup) throw new ConflictException('Código já utilizado neste estabelecimento.');
      codigo = dto.codigo;
    } else {
      codigo = await this.generateUniqueCode(estabelecimentoId);
    }

    const currentActive = await this.prisma.codigoAcesso.findFirst({
      where: { estabelecimentoId, status: 'ativo' },
      select: { id: true, codeValue: true },
    });

    // Se já existe um código ativo, sinaliza ao controller para pedir confirmação
    if (currentActive) {
      return {
        confirmacao: true,
        idAtivoAtual: currentActive.id,
        codigoAtivoAtual: currentActive.codeValue,
        codigoPendente: codigo,
      };
    }

    return this.persistCode(codigo, dto, estabelecimentoId, criadoPor, 'ativo');
  }

  async confirmarSubstituicao(dto: ConfirmarSubstituicaoDto, estabelecimentoId: string, criadoPor: string) {
    const current = await this.prisma.codigoAcesso.findFirst({
      where: { id: dto.codigo, estabelecimentoId, status: 'ativo' },
    });
    if (!current) throw new NotFoundException('Código ativo atual não encontrado.');

    return this.prisma.$transaction(async tx => {
      await tx.codigoAcesso.update({
        where: { id: dto.codigo },
        data: { status: 'revogado', updatedBy: criadoPor },
      });
      const created = await this.persistCodeTx(tx, dto.novoCodigo, dto, estabelecimentoId, criadoPor, 'ativo');

    //   await this.audit.log({
    //     responsibleUserId: createdBy,
    //     establishmentId,
    //     eventType: 'code.replaced',
    //     affectedResource: 'access_code',
    //     affectedResourceId: created.id,
    //   });

      return created;
    });
  }

  async createAsRevoked(dto: CriarCodigoDto, estabelecimentoId: string, criadoPor: string) {
    let codigo: string;
    if (dto.modoGeracao === 'manual' && dto.codigo) {
      codigo = dto.codigo;
    } else {
      codigo = await this.generateUniqueCode(estabelecimentoId);
    }
    return this.persistCode(codigo, dto, estabelecimentoId, criadoPor, 'revogado');
  }

  async revoke(id: string, estabelecimentoId: string, revogadoPor: string) {
    const code = await this.prisma.codigoAcesso.findFirst({ where: { id, estabelecimentoId } });
    if (!code) throw new NotFoundException('Código não localizado.');
    if (code.status !== 'ativo') {
      throw new BadRequestException('Somente códigos ativos podem ser revogados.');
    }

    const updated = await this.prisma.codigoAcesso.update({
      where: { id },
      data: { status: 'revogado', atualizadoPor: revogadoPor },
    });

    // await this.audit.log({
    //   responsibleUserId: revokedBy,
    //   establishmentId,
    //   eventType: 'code.revoked',
    //   affectedResource: 'access_code',
    //   affectedResourceId: id,
    // });

    return updated;
  }

  async reactivate(id: string, estabelecimentoId: string, reativadoPor: string) {
    const code = await this.prisma.codigoAcesso.findFirst({ where: { id, estabelecimentoId } });
    if (!code) throw new NotFoundException('Código não localizado.');

    // RF023: código expirado NÃO pode ser reativado
    if (code.status === 'expirado') {
      throw new BadRequestException(
        'Este código está expirado e não pode ser reativado. Crie um novo código.',
      );
    }
    if (code.status === 'ativo') {
      throw new BadRequestException('Este código já está ativo.');
    }

    // Revogar qualquer outro código ativo antes de reativar
    await this.prisma.codigoAcesso.updateMany({
      where: { estabelecimentoId, status: 'ativo' },
      data: { status: 'revogado', atualizadoPor: reativadoPor },
    });

    const updated = await this.prisma.codigoAcesso.update({
      where: { id },
      data: { status: 'ativo', atualizadoPor: reativadoPor },
    });

    // await this.audit.log({
    //   responsibleUserId: reactivatedBy,
    //   establishmentId,
    //   eventType: 'code.reactivated',
    //   affectedResource: 'access_code',
    //   affectedResourceId: id,
    // });

    return updated;
  }

  async getQrData(id: string, establishmentId: string) {
    const code = await this.prisma.codigoAcesso.findFirst({
      where: { id, establishmentId, status: 'ativo' },
    });
    if (!code?.imagemQr) throw new NotFoundException('QR Code não disponível para este código.');
    return { imagemQr: code.imagemQr, codigo: code.codigo };
  }

  async findAll(estabelecimentoId: string) {
    return this.prisma.codigoAcesso.findMany({
      where: { estabelecimentoId },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        codigo: true,
        status: true,
        modoGeracao: true,
        descricao: true,
        validoDe: true,
        validoAte: true,
        gerarQr: true,
        criadoPor: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });
  }

  // Chamado pelo CRON scheduler
  async expireOldCodes() {
    return this.prisma.codigoAcesso.updateMany({
      where: {
        status: 'ativo',
        validUntil: { lt: new Date() },
      },
      data: { status: 'expirado' },
    });
  }

  // ── Helpers privados ─────────────────────────────────────

  private async persistCode(
    codigo: string,
    dto: CriarCodigoDto | ConfirmarSubstituicaoDto,
    estabelecimentoId: string,
    criadoPor: string,
    status: StatusCodigo,
  ) {
    let imagemQr: string | undefined;
    if ((dto as CriarCodigoDto).gerarQr !== false) {
      imagemQr = await QRCode.toDataURL(codigo, { errorCorrectionLevel: 'H' });
    }

    const created = await this.prisma.codigoAcesso.create({
      data: {
        estabelecimentoId,
        codigo,
        modoGeracao: (dto as CriarCodigoDto).modoGeracao ?? 'automatico',
        descricao: dto.descricao,
        validoDe: dto.validoDe ? new Date(dto.validoDe) : null,
        validoAte: dto.validoAte ? new Date(dto.validoAte) : null,
        status,
        gerarQr: (dto as CriarCodigoDto).gerarQr !== false,
        imagemQr,
        criadoPor,
      },
    });

    // await this.audit.log({
    //   responsibleUserId: createdBy,
    //   establishmentId,
    //   eventType: `code.created.${status}`,
    //   affectedResource: 'access_code',
    //   affectedResourceId: created.id,
    // });

    return created;
  }

  private async persistCodeTx(
    tx: any,
    codigo: string,
    dto: ConfirmarSubstituicaoDto,
    estabelecimentoId: string,
    criadoPor: string,
    status: StatusCodigo,
  ) {
    let imagemQr: string | undefined;
    if (dto.gerarQr !== false) {
      imagemQr = await QRCode.toDataURL(codigo, { errorCorrectionLevel: 'H' });
    }

    return tx.accessCode.create({
      data: {
        estabelecimentoId,
        codigo,
        modoGeracao: 'manual',
        descricao: dto.descricao,
        validoDe: dto.validoDe ? new Date(dto.validoDe) : null,
        validoAte: dto.validoAte ? new Date(dto.validoAte) : null,
        status,
        gerarQr: dto.gerarQr !== false,
        imagemQr,
        criadoPor,
      },
    });
  }

  private async generateUniqueCode(estabelecimentoId: string): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)],
      ).join('');

      const exists = await this.prisma.codigoAcesso.findUnique({
        where: { estabelecimentoId_codigo: { estabelecimentoId, codigo: candidate } },
      });
      if (!exists) return candidate;
    }
    throw new BadRequestException('Não foi possível gerar um código único. Tente novamente.');
  }
}
