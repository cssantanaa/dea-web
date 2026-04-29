import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateBarrierDto,
  UpdateBarrierDto,
  FilterBarrierDto,
} from './dto/barrier.dto';

@Injectable()
export class BarriersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(dto: CreateBarrierDto, establishmentId: string, createdBy: string) {
    if (dto.periodEnd && new Date(dto.periodEnd) <= new Date(dto.periodStart)) {
      throw new BadRequestException('A data final deve ser posterior à data inicial.');
    }

    // RF026: nome único por andar enquanto ativa
    const existingActive = await this.prisma.barrier.findFirst({
      where: {
        establishmentId,
        floor: dto.floor,
        name: dto.name,
        status: 'ativa',
      },
    });
    if (existingActive) {
      throw new BadRequestException('Já existe uma barreira ativa com este nome neste andar.');
    }

    const now = new Date();
    const periodStart = new Date(dto.periodStart);
    const isImmediate = periodStart <= now;

    const barrier = await this.prisma.barrier.create({
      data: {
        ...dto,
        establishmentId,
        periodStart,
        periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : null,
        status: isImmediate ? 'ativa' : 'agendada',
        activatedAt: isImmediate ? now : null,
        createdBy,
      },
    });

    await this.audit.log({
      responsibleUserId: createdBy,
      establishmentId,
      eventType: `barrier.created.${barrier.status}`,
      affectedResource: 'barrier',
      affectedResourceId: barrier.id,
    });

    return barrier;
  }

  async findAll(establishmentId: string, filters: FilterBarrierDto) {
    return this.prisma.barrier.findMany({
      where: {
        establishmentId,
        ...(filters.status && { status: filters.status as any }),
        ...(filters.floor && { floor: filters.floor }),
        ...(filters.visibility && { visibility: filters.visibility }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(establishmentId: string) {
    return this.prisma.barrier.findMany({
      where: { establishmentId, status: 'ativa' },
      orderBy: { severity: 'asc' },
    });
  }

  async findOne(id: string, establishmentId: string) {
    const barrier = await this.prisma.barrier.findFirst({
      where: { id, establishmentId },
    });
    if (!barrier) throw new NotFoundException('Barreira não encontrada.');
    return barrier;
  }

  async update(id: string, dto: UpdateBarrierDto, establishmentId: string, updatedBy: string) {
    const barrier = await this.findOne(id, establishmentId);

    // RF026: registros encerrados não podem ser editados
    if (barrier.status === 'encerrada') {
      throw new BadRequestException('Registros encerrados não podem ser editados.');
    }

    if (dto.periodStart && dto.periodEnd) {
      if (new Date(dto.periodEnd) <= new Date(dto.periodStart)) {
        throw new BadRequestException('A data final deve ser posterior à data inicial.');
      }
    }

    const updated = await this.prisma.barrier.update({
      where: { id },
      data: {
        ...dto,
        periodStart: dto.periodStart ? new Date(dto.periodStart) : undefined,
        periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : undefined,
        updatedBy,
      },
    });

    await this.audit.log({
      responsibleUserId: updatedBy,
      establishmentId,
      eventType: 'barrier.updated',
      affectedResource: 'barrier',
      affectedResourceId: id,
    });

    return updated;
  }

  async toggleStatus(id: string, establishmentId: string, isActive: boolean, updatedBy: string) {
    const barrier = await this.findOne(id, establishmentId);

    if (barrier.status === 'encerrada') {
      throw new BadRequestException('Barreiras encerradas não podem ser reativadas.');
    }

    const newStatus = isActive ? 'ativa' : 'inativa';
    const updated = await this.prisma.barrier.update({
      where: { id },
      data: {
        status: newStatus,
        activatedAt: isActive && !barrier.activatedAt ? new Date() : undefined,
        updatedBy,
      },
      select: { id: true, name: true, status: true },
    });

    await this.audit.log({
      responsibleUserId: updatedBy,
      establishmentId,
      eventType: isActive ? 'barrier.activated' : 'barrier.deactivated',
      affectedResource: 'barrier',
      affectedResourceId: id,
    });

    return updated;
  }

  async closeBarrier(id: string, establishmentId: string, closedBy: string) {
    const barrier = await this.findOne(id, establishmentId);

    if (barrier.status === 'encerrada') {
      throw new BadRequestException('Esta barreira já foi encerrada.');
    }

    const updated = await this.prisma.barrier.update({
      where: { id },
      data: { status: 'encerrada', closedAt: new Date(), updatedBy: closedBy },
      select: { id: true, name: true, status: true, closedAt: true },
    });

    await this.audit.log({
      responsibleUserId: closedBy,
      establishmentId,
      eventType: 'barrier.closed',
      affectedResource: 'barrier',
      affectedResourceId: id,
    });

    return updated;
  }

  // ── Chamados pelo CRON ──────────────────────────────────────────────────

  async activateScheduled() {
    const now = new Date();
    return this.prisma.barrier.updateMany({
      where: { status: 'agendada', periodStart: { lte: now } },
      data: { status: 'ativa', activatedAt: now },
    });
  }

  async closeExpired() {
    const now = new Date();
    return this.prisma.barrier.updateMany({
      where: {
        status: { in: ['ativa', 'agendada'] },
        periodEnd: { lt: now },
      },
      data: { status: 'encerrada', closedAt: now },
    });
  }
}
