import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CriarBarreiraDto } from './dto/criar-barreira.dto';
import { AtualizarBarreiraDto } from './dto/atualizar-barreira.dto';
import { FiltrarBarreiraDto } from './dto/filtrar-barreira.dto';
import { AlterarStatusBarreiraDto } from './dto/alternar-status-barreira.dto';

@Injectable()
export class BarreiraService {
  constructor(
    private prisma: PrismaService,
    // private audit: AuditoriaService,
  ) {}

  async criar(dto: CriarBarreiraDto, estabelecimentoId: string, criadoPor: string) {
    if (dto.periodoFinal && new Date(dto.periodoFinal) <= new Date(dto.periodoInicial)) {
      throw new BadRequestException('A data final deve ser posterior à data inicial.');
    }

    // RF026: nome único por andar enquanto ativa
    const existeAtivo = await this.prisma.barreira.findFirst({
      where: {
        estabelecimentoId,
        andar: dto.andar,
        nome: dto.nome,
        status: 'ativa',
      },
    });
    if (existeAtivo) {
      throw new BadRequestException('Já existe uma barreira ativa com este nome neste andar.');
    }

    const now = new Date();
    const periodoInicial = new Date(dto.periodoInicial);
    const imediato = periodoInicial <= now;

    const barreira = await this.prisma.barreira.create({
      data: {
        ...dto,
        estabelecimentoId,
        periodoInicial: new Date(dto.periodoInicial),
        periodoFinal: dto.periodoFinal ? new Date(dto.periodoFinal) : null,
        status: imediato ? 'ativa' : 'agendada',
        ativadoEm: imediato ? now : null,
        criadoPor,
      },
    });

    // await this.audit.log({
    //   responsibleUserId: createdBy,
    //   establishmentId,
    //   eventType: `barrier.created.${barrier.status}`,
    //   affectedResource: 'barrier',
    //   affectedResourceId: barrier.id,
    // });

    return barreira;
  }

  async listarBarreiras(estabelecimentoId: string, filtros: FiltrarBarreiraDto) {
    return this.prisma.barreira.findMany({
      where: {
        estabelecimentoId,
        ...(filtros.status && { status: filtros.status as any }),
        ...(filtros.andar && { andar: filtros.andar }),
        ...(filtros.visibilidade && { visibilidade: filtros.visibilidade }),
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async listarAtivas(estabelecimentoId: string) {
    return this.prisma.barreira.findMany({
      where: { estabelecimentoId, status: 'ativa' },
      orderBy: { severidade: 'asc' },
    });
  }

  async buscarPorId(id: string, estabelecimentoId: string) {
    const barreira = await this.prisma.barreira.findFirst({
      where: { id, estabelecimentoId },
    });
    if (!barreira) throw new NotFoundException('Barreira não encontrada.');
    return barreira;
  }

  async atualizar(id: string, dto: AtualizarBarreiraDto, estabelecimentoId: string, atualizadoPor: string) {
    const barreira = await this.buscarPorId(id, estabelecimentoId);

    // RF026: registros encerrados não podem ser editados
    if (barreira.status === 'encerrada') {
      throw new BadRequestException('Registros encerrados não podem ser editados.');
    }

    if (dto.periodoInicial && dto.periodoFinal) {
      if (new Date(dto.periodoFinal) <= new Date(dto.periodoInicial)) {
        throw new BadRequestException('A data final deve ser posterior à data inicial.');
      }
    }

    const updated = await this.prisma.barreira.update({
      where: { id },
      data: {
        ...dto,
        periodoInicial: dto.periodoInicial ? new Date(dto.periodoInicial) : undefined,
        periodoFinal: dto.periodoFinal ? new Date(dto.periodoFinal) : undefined,
        atualizadoPor,
      },
    });

    // await this.audit.log({
    //   responsibleUserId: updatedBy,
    //   establishmentId,
    //   eventType: 'barrier.updated',
    //   affectedResource: 'barrier',
    // //   affectedResourceId: id,
    // });

    return updated;
  }

  async alternarStatusBarreira(id: string, estabelecimentoId: string, ativo: boolean, atualizadoPor: string) {
    const barreira = await this.buscarPorId(id, estabelecimentoId);

    if (barreira.status === 'encerrada') {
      throw new BadRequestException('Barreiras encerradas não podem ser reativadas.');
    }

    const newStatus = ativo ? 'ativa' : 'inativa';
    const updated = await this.prisma.barreira.update({
      where: { id },
      data: {
        status: newStatus,
        ativadoEm: ativo && !barreira.ativadoEm ? new Date() : undefined,
        atualizadoPor,
      },
      select: { id: true, nome: true, status: true },
    });

    // await this.audit.log({
    //   responsibleUserId: updatedBy,
    //   establishmentId,
    //   eventType: isActive ? 'barrier.activated' : 'barrier.deactivated',
    //   affectedResource: 'barrier',
    //   affectedResourceId: id,
    //  });

    return updated;
  }

  async fecharBarreira(id: string, establishmentId: string, closedBy: string) {
    const barreira = await this.buscarPorId(id, establishmentId);

    if (barreira.status === 'encerrada') {
      throw new BadRequestException('Esta barreira já foi encerrada.');
    }

    const updated = await this.prisma.barreira.update({
      where: { id },
      data: { status: 'encerrada', fechadoEm: new Date(), updatedBy: closedBy },
      select: { id: true, nome: true, status: true, fechadoEm: true },
    });

    // await this.audit.log({
    //   responsibleUserId: closedBy,
    //   establishmentId,
    //   eventType: 'barrier.closed',
    //   affectedResource: 'barrier',
    //   affectedResourceId: id,
    // });

    return updated;
  }

  async ativarBarreirasAgendadas() {
    const now = new Date();
    return this.prisma.barreira.updateMany({
      where: { status: 'agendada', periodoInicial: { lte: now } },
      data: { status: 'ativa', ativadoEm: now },
    });
  }

  async fecharBarreirasExpiradas() {
    const now = new Date();
    return this.prisma.barreira.updateMany({
      where: {
        status: { in: ['ativa', 'agendada'] },
        periodoFinal: { lt: now },
      },
      data: { status: 'encerrada', fechadoEm: now },
    });
  }
}
