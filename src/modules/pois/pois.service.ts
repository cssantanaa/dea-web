import { PrismaService } from "prisma/prisma.service";
import { CriarPoiDto } from "./dto/poi.dto";
import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { TipoPoi } from "@prisma/client";

@Injectable()
export class PoisService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CriarPoiDto, estabelecimentoId: string, criadoPor: string) {
    const existe = await this.prisma.poi.findUnique({
      where: {
        estabelecimentoId_tipo_nome_andar: {
          estabelecimentoId, tipo: dto.tipo, nome: dto.nome, andar: dto.andar,
        },
      },
    });

    if (existe) { throw new ConflictException('Já existe um POI com este nome neste andar.'); }

    if (!dto.posicao || typeof dto.posicao !== 'object') {
      throw new BadRequestException('Posição inválida.');
    }

    return this.prisma.poi.create({
      data: {
        tipo: dto.tipo,
        detalheTipo: dto.detalheTipo,
        nome: dto.nome,
        andar: dto.andar,
        posicao: dto.posicao as any,
        acessibilidade: dto.acessibilidade,
        disponibilidade: dto.disponibilidade,
        visibilidade: dto.visibilidade,
        capacidadeOuDetalhes: dto.capacidadeOuDetalhes,
        prioridadeRota: dto.prioridadeRota,
        estabelecimentoId,
        criadoPor,
      },
    });
  }

  async findAll(
    estabelecimentoId: string,
    filters: {
      tipo?: TipoPoi;
      andar?: string;
      disponibilidade?: string;
      visibilidade?: string;
    },
  ) {
    return this.prisma.poi.findMany({
      where: {
        estabelecimentoId,
        ...(filters.tipo && { tipo: filters.tipo }),
        ...(filters.andar && { andar: filters.andar }),
        ...(filters.disponibilidade && { disponibilidade: filters.disponibilidade as any }),
        ...(filters.visibilidade && { visibilidade: filters.visibilidade as any }),
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string, estabelecimentoId: string) {
    const poi = await this.prisma.poi.findFirst({
      where: { id, estabelecimentoId },
    });

    if (!poi) throw new NotFoundException('POI não encontrado.');
    return poi;
  }

  async update(
    id: string,
    dto: Partial<CriarPoiDto>,
    estabelecimentoId: string,
    atualizadoPor: string,
  ) {
    await this.findOne(id, estabelecimentoId);

    // return this.prisma.poi.update({
    //   where: {
    //     id,
    //   },
    //   data: {
    //     ...dto,
    //     atualizadoPor,
    //   },
    // });
  }

  async remove(id: string, estabelecimentoId: string) {
    await this.findOne(id, estabelecimentoId);

    return this.prisma.poi.delete({
      where: { id },
    });
  }
}