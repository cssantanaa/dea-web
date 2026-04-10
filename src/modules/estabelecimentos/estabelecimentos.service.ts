import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CriarEstabelecimentosDto } from './dto/estabelecimentos.dto';
import { CategoriaEstabelecimento, StatusEstabelecimento } from '@prisma/client';

@Injectable()
export class EstabelecimentoService {
  constructor(
    private prisma: PrismaService,
    // private audit: AuditService,
  ) {}

  async create(dto: CriarEstabelecimentosDto, userId: string) {
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
        dataInicioEvento: dto.dataInicioEvento ? new Date(dto.dataInicioEvento) : null,
        dataFimEvento: dto.dataFimEvento ? new Date(dto.dataFimEvento) : null,
        criadoPor: userId,
        categoria: dto.categoriaEstabelecimento as CategoriaEstabelecimento,
      },
    });

    // await this.audit.log({
    //   usuarioResponsavelId: userId,
    //   papelUsuarioResponsavel: 'super_admin',
    //   idEstabelecimento: estabelecimento.id,
    //   tipoEvento: 'establishment.created',
    //   recursoAfetado: 'establishment',
    //   idRecursoAfetado: estabelecimento.id,
    // });

    return estabelecimento;
  }

  async findAll(filters: { status?: StatusEstabelecimento; categoria?: string }) {
    return this.prisma.estabelecimento.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.categoria && { categoria: filters.categoria as any }),
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findOne(id: string) {
    const e = await this.prisma.estabelecimento.findUnique({ where: { id } });
    if (!e) throw new NotFoundException('Estabelecimento não encontrado.');
    return e;
  }

  async update(id: string, dto: Partial<CriarEstabelecimentosDto>, userId: string) {
    await this.findOne(id); // garante existência
    return this.prisma.estabelecimento.update({
      where: { id },
      data: {
        ...dto,
        dataInicioEvento: dto.dataInicioEvento ? new Date(dto.dataInicioEvento) : undefined,
        dataFimEvento: dto.dataFimEvento ? new Date(dto.dataFimEvento) : undefined,
        atualizadoPor: userId,
      },
    });
  }

  async setStatus(id: string, status: StatusEstabelecimento, userId: string) {
    await this.findOne(id);
    const atualizado = await this.prisma.estabelecimento.update({
      where: { id },
      data: { status, atualizadoPor: userId },
    });
    // await this.audit.log({
    //   usuarioResponsavelId: userId,
    //   papelUsuarioResponsavel: 'super_admin',
    //   idEstabelecimento: id,
    //   tipoEvento: `establishment.status_changed.${status}`,
    //   recursoAfetado: 'establishment',
    //   idRecursoAfetado: id,
    // });
    return atualizado;
  }

//   Chamado pelo scheduler CRON
  async closeExpiredEvents() {
    return this.prisma.estabelecimento.updateMany({
      where: {
        tipoOperacao: 'evento',
        dataFimEvento: { lt: new Date() },
        status: { not: 'encerrado' },
      },
      data: { status: 'encerrado' },
    });
  }
}