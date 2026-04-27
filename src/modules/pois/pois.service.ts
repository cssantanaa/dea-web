import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CriarPoiDto } from './dto/criar-poi.dto';
import { AtualizarPoiDto, filtrarPoiDto } from './dto/atualizar-poi.dto';
// import audit service when available

@Injectable()
export class PoisService {
  constructor(
    private prisma: PrismaService,
    // private audit: AuditService,
  ) {}

  private async AcessoEstabelecimento(estabelecimentoId: string) {
    const est = await this.prisma.estabelecimento.findUnique({
      where: { id: estabelecimentoId },
    });
    if (!est) throw new NotFoundException('Estabelecimento não encontrado.');
    if (est.status === 'encerrado') {
      throw new ForbiddenException('Estabelecimento encerrado não permite alterações.');
    }
    return est;
  }

  async criar(dto: CriarPoiDto, estabelecimentoId: string, createdBy: string) {
    await this.AcessoEstabelecimento(estabelecimentoId);

    const existe = await this.prisma.poi.findFirst({
      where: {
        estabelecimentoId: estabelecimentoId,
        tipo: dto.tipo,
        nome: dto.nome,
        andar: dto.andar,
      },
    });
    if (existe) {
      throw new ConflictException('Já existe um POI com este nome neste andar.');
    }

    if (!dto.posicao || typeof dto.posicao !== 'object') {
      throw new BadRequestException('Posição inválida para este andar.');
    }

    const poi = await this.prisma.poi.create({
      data: { ...dto, estabelecimentoId, criadoPor: createdBy },
    });

    return poi;
  }

  async findAll(estabelecimentoId: string, filtros: filtrarPoiDto) {
    return this.prisma.poi.findMany({
      where: {
        estabelecimentoId,
        ...(filtros.tipo && { tipo: filtros.tipo }),
        ...(filtros.andar && { andar: filtros.andar }),
        ...(filtros.disponibilidade && { disponibilidade: filtros.disponibilidade }),
        ...(filtros.visibilidade && { visibilidade: filtros.visibilidade }),
      },
      orderBy: [{ andar: 'asc' }, { nome: 'asc' }],
    });
  }

  async findOne(id: string, estabelecimentoId: string) {
    const poi = await this.prisma.poi.findFirst({ where: { id, estabelecimentoId } });
    if (!poi) throw new NotFoundException('POI não encontrado.');
    return poi;
  }

  async atualizar(id: string, dto: AtualizarPoiDto, estabelecimentoId: string, updatedBy: string) {
    const poi = await this.findOne(id, estabelecimentoId);

    // Verifica duplicidade de nome se nome ou andar foram alterados
      const novoNome = dto.nome ?? poi.nome;
      const novoAndar = dto.andar ?? poi.andar;
      const novoTipo = dto.tipo ?? poi.tipo;

      const duplicado = await this.prisma.poi.findFirst({
        where: {
          estabelecimentoId,
          tipo: novoTipo,
          nome: novoNome,
          andar: novoAndar,
          id: { not: id },
        },
      });
      if (duplicado) throw new ConflictException('Já existe um POI com este nome neste andar.');
    

      const atualizado = await this.prisma.poi.update({
        where: { id },
        data: { ...dto, atualizadoPor: updatedBy },
      });
      return atualizado;
  }

  async remover(id: string, estabelecimentoId: string, deletadoPor: string) {
    await this.findOne(id, estabelecimentoId);

  //   // RF021: POI com histórico recente não pode ser excluído — apenas inativado.
  //   // Descomente quando a tabela de ocorrências estiver disponível:
  //   // const recentUsage = await this.prisma.occurrenceDestination.count({
  //   //   where: { poiId: id, createdAt: { gte: subDays(new Date(), 30) } },
  //   // });
  //   // if (recentUsage > 0) {
  //   //   throw new BadRequestException(
  //   //     'Este POI possui histórico recente e não pode ser excluído. Inative-o.',
  //   //   );
  //   // }

  //   await this.prisma.poi.delete({ where: { id } });

  //   return { message: 'POI excluído com sucesso.' };
  // }
  }
}