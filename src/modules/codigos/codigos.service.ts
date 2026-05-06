import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { PrismaService } from 'prisma/prisma.service';
import { CriarCodigoDto } from './dto/criar-codigo.dto';
import { ConfirmarSubstituicaoDto } from './dto/confirmar-substituicao.dto';
import { StatusCodigo } from '@prisma/client';

@Injectable()
export class CodigosService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CriarCodigoDto, estabelecimentoId: string, criadoPor: string ) {
    this.validarDatas(dto);

    let valorCodigo: string;

    if (dto.modoGeracao === 'manual') {
      if (!dto.codigo) {
        throw new BadRequestException(
          'Informe o valor do código no modo manual.',
        );
      }

      await this.verificarDuplicidade(estabelecimentoId, dto.codigo);
      valorCodigo = dto.codigo;
    } else {
      valorCodigo = await this.gerarCodigoUnico(estabelecimentoId);
    }

    const codigoAtivo = await this.buscarCodigoAtivo(estabelecimentoId);

    if (codigoAtivo) {
      return {
        requerConfirmacao: true,
        codigoAtualId: codigoAtivo.id,
        codigoAtualValor: codigoAtivo.codigo,
        novoCodigo: valorCodigo,
      };
    }

    return this.persistirCodigo(
      valorCodigo,
      dto,
      estabelecimentoId,
      criadoPor,
      'ativo',
    );
  }

  async confirmarSubstituicao(
    dto: ConfirmarSubstituicaoDto,
    estabelecimentoId: string,
    criadoPor: string,
  ) {
    const codigoAtual = await this.prisma.codigoAcesso.findFirst({
      where: {
        id: dto.codigo,
        estabelecimentoId,
        status: 'ativo',
      },
    });

    if (!codigoAtual) {
      throw new NotFoundException('Código ativo atual não encontrado.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.codigoAcesso.update({
        where: { id: dto.codigo },
        data: { status: 'revogado', atualizadoPor: criadoPor },
      });

      return this.persistirCodigoTx(
        tx,
        dto.codigo,
        dto,
        estabelecimentoId,
        criadoPor,
        'ativo',
      );
    });
  }

  async criarComoRevogado(
    dto: CriarCodigoDto,
    estabelecimentoId: string,
    criadoPor: string,
  ) {
    const valorCodigo =
      dto.modoGeracao === 'manual' && dto.codigo
        ? dto.codigo
        : await this.gerarCodigoUnico(estabelecimentoId);

    return this.persistirCodigo(
      valorCodigo,
      dto,
      estabelecimentoId,
      criadoPor,
      'revogado',
    );
  }

  async revogar(
    id: string,
    estabelecimentoId: string,
    atualizadoPor: string,
  ) {
    const codigo = await this.buscarPorId(id, estabelecimentoId);

    if (codigo.status !== 'ativo') {
      throw new BadRequestException(
        'Somente códigos ativos podem ser revogados.',
      );
    }

    return this.prisma.codigoAcesso.update({
      where: { id },
      data: { status: 'revogado', atualizadoPor },
    });
  }

  async reativar(
    id: string,
    estabelecimentoId: string,
    atualizadoPor: string,
  ) {
    const codigo = await this.buscarPorId(id, estabelecimentoId);

    if (codigo.status === 'expirado') {
      throw new BadRequestException(
        'Este código está expirado e não pode ser reativado.',
      );
    }

    if (codigo.status === 'ativo') {
      throw new BadRequestException('Este código já está ativo.');
    }

    await this.prisma.codigoAcesso.updateMany({
      where: { estabelecimentoId, status: 'ativo' },
      data: { status: 'revogado', atualizadoPor },
    });

    return this.prisma.codigoAcesso.update({
      where: { id },
      data: { status: 'ativo', atualizadoPor },
    });
  }

  async obterQrCode(id: string, estabelecimentoId: string) {
    const codigo = await this.prisma.codigoAcesso.findFirst({
      where: { id, estabelecimentoId, status: 'ativo' },
    });

    if (!codigo?.imagemQr) {
      throw new NotFoundException(
        'QR Code não disponível para este código.',
      );
    }

    return {
      imagemQr: codigo.imagemQr,
      codigo: codigo.codigo,
    };
  }

  async listar(estabelecimentoId: string) {
    return this.prisma.codigoAcesso.findMany({
      where: { estabelecimentoId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async expirarCodigosAntigos() {
    return this.prisma.codigoAcesso.updateMany({
      where: {
        status: 'ativo',
        validoAte: { lt: new Date() },
      },
      data: { status: 'expirado' },
    });
  }

  // ======================
  // MÉTODOS PRIVADOS
  // ======================

  private validarDatas(dto: CriarCodigoDto | ConfirmarSubstituicaoDto) {
    if (dto.validoDe && dto.validoAte) {
      if (new Date(dto.validoAte) <= new Date(dto.validoDe)) {
        throw new BadRequestException(
          'A data final deve ser posterior à inicial.',
        );
      }
    }
  }

  private async verificarDuplicidade(
    estabelecimentoId: string,
    codigo: string,
  ) {
    const existente = await this.prisma.codigoAcesso.findUnique({
      where: {
        estabelecimentoId_codigo: { estabelecimentoId, codigo },
      },
    });

    if (existente) {
      throw new ConflictException(
        'Código já utilizado neste estabelecimento.',
      );
    }
  }

  private async buscarCodigoAtivo(estabelecimentoId: string) {
    return this.prisma.codigoAcesso.findFirst({
      where: { estabelecimentoId, status: 'ativo' },
      select: { id: true, codigo: true },
    });
  }

  private async buscarPorId(id: string, estabelecimentoId: string) {
    const codigo = await this.prisma.codigoAcesso.findFirst({
      where: { id, estabelecimentoId },
    });

    if (!codigo) {
      throw new NotFoundException('Código não localizado.');
    }

    return codigo;
  }

  private async persistirCodigo(
    valorCodigo: string,
    dto: CriarCodigoDto | ConfirmarSubstituicaoDto,
    estabelecimentoId: string,
    criadoPor: string,
    status: StatusCodigo,
  ) {
    let imagemQr: string | undefined;

    if ((dto as CriarCodigoDto).gerarQr !== false) {
      imagemQr = await QRCode.toDataURL(valorCodigo, {
        errorCorrectionLevel: 'H',
      });
    }

    return this.prisma.codigoAcesso.create({
      data: {
        estabelecimentoId,
        codigo: valorCodigo,
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
  }

  private async persistirCodigoTx(
    tx: any,
    valorCodigo: string,
    dto: ConfirmarSubstituicaoDto,
    estabelecimentoId: string,
    criadoPor: string,
    status: StatusCodigo,
  ) {
    let imagemQr: string | undefined;

    if (dto.gerarQr !== false) {
      imagemQr = await QRCode.toDataURL(valorCodigo, {
        errorCorrectionLevel: 'H',
      });
    }

    return tx.codigoAcesso.create({
      data: {
        estabelecimentoId,
        codigo: valorCodigo,
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

  private async gerarCodigoUnico(
    estabelecimentoId: string,
  ): Promise<string> {
    const caracteres =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let tentativa = 0; tentativa < 10; tentativa++) {
      const candidato = Array.from({ length: 6 }, () =>
        caracteres[Math.floor(Math.random() * caracteres.length)],
      ).join('');

      const existe = await this.prisma.codigoAcesso.findUnique({
        where: {
          estabelecimentoId_codigo: {
            estabelecimentoId,
            codigo: candidato,
          },
        },
      });

      if (!existe) return candidato;
    }

    throw new BadRequestException( 'Não foi possível gerar um código único.' );
  }
}