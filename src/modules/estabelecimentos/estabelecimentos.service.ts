import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CriarEstabelecimentoDto } from './dto/criar-estabelecimentos.dto';
import { AtualizarEstabelecimentoDto } from './dto/atualizar-estabelecimento.dto';
import { FiltrarEstabelecimentoDto } from './dto/filtrar-estabelecimento.dto';
import { StatusEstabelecimento } from '@prisma/client';


@Injectable()
export class EstabelecimentoService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async criar(dto: CriarEstabelecimentoDto, userId: string) {
    if (dto.tipoOperacao === 'evento') {
      if (!dto.dataInicioEvento || !dto.dataFimEvento) {
        throw new BadRequestException('Informe início e fim do evento.');
      }
      if (new Date(dto.dataFimEvento) <= new Date(dto.dataInicioEvento)) {
        throw new BadRequestException('A data final deve ser posterior à data inicial.');
      }
    }

    const estabelecimento = await this.prisma.estabelecimento.create({
      data: {
        ...dto,
        categoria: dto.categoriaEstabelecimento,
        dataInicioEvento: dto.dataInicioEvento ? new Date(dto.dataInicioEvento) : null,
        dataFimEvento: dto.dataFimEvento ? new Date(dto.dataFimEvento) : null,
        criadoPor: userId,
        status: 'rascunho',
      }
    });

    return estabelecimento;
  }

  async findAll(filtros: FiltrarEstabelecimentoDto) {
    return this.prisma.estabelecimento.findMany({
      where: {
        ...(filtros.status && { status: filtros.status }),
        ...(filtros.categoria && { categoria: filtros.categoria }),
        ...(filtros.buscar && {
          nome: { contains: filtros.buscar, mode: 'insensitive' },
        }),
      },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        nome: true,
        clienteOrganizador: true,
        tipoOperacao: true,
        categoria: true,
        status: true,
        statusConfiguracaoMapa: true,
        cidade: true,
        estado: true,
        dataInicioEvento: true,
        dataFimEvento: true,
        criadoEm: true,
      },
    });
  }

  async findOne(id: string) {
    const estabelecimento = await this.prisma.estabelecimento.findUnique({ where: { id } });
    if (!estabelecimento) throw new NotFoundException('Estabelecimento não encontrado.');
    return estabelecimento;
  }

  async atualizar(id: string, dto: AtualizarEstabelecimentoDto, userId: string) {
    const estabelecimento = await this.findOne(id);

    if (estabelecimento.status === 'encerrado') {
      throw new ForbiddenException('Estabelecimentos encerrados não podem ser editados.');
    }

    if (dto.dataInicioEvento && dto.dataFimEvento) {
      if (new Date(dto.dataFimEvento) <= new Date(dto.dataInicioEvento)) {
        throw new BadRequestException('A data final deve ser posterior à data inicial.');
      }
    }

    const atualizado = await this.prisma.estabelecimento.update({
      where: { id },
      data: {
        ...dto,
        dataInicioEvento: dto.dataInicioEvento ? new Date(dto.dataInicioEvento) : null,
        dataFimEvento: dto.dataFimEvento ? new Date(dto.dataFimEvento) : null,
        atualizadoPor: userId,
      },
    });
    return atualizado;
  }

  async definirStatus(id: string, status: StatusEstabelecimento, userId: string) {
    await this.findOne(id);
    const atualizado = await this.prisma.estabelecimento.update({
      where: { id },
      data: { status, atualizadoPor: userId },
      select: { id: true, nome: true, status: true },
    });

    return atualizado;
  }

  async EncerrarEstabelecimentosExpirados() {
    return this.prisma.estabelecimento.updateMany({
      where: {
        tipoOperacao: 'evento',
        dataFimEvento: { lt: new Date() },
        status: { notIn: ['encerrado', 'inativo'] },
      },
      data: { status: 'encerrado' },
    });
  }
}