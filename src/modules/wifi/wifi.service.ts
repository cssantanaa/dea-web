import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CriarWifiDto } from './dto/criar-wifi.dto';
import { AtualizarWifiDto } from './dto/atualizar-wifi.dto';
import { FiltrarWifiDto } from './dto/filtrar-wifi.dto';

@Injectable()
export class WifiService {
  constructor(private prisma: PrismaService) {}

  async criarWifi(dto: CriarWifiDto, estabelecimentoId: string, criadoPor: string) {
    if (dto.validoDe && dto.validoAte) {
      if (new Date(dto.validoAte) <= new Date(dto.validoDe)) {
        throw new BadRequestException('A data final deve ser posterior à data inicial.');
      }
    }

    const existe = await this.prisma.redeWifi.findFirst({
      where: { estabelecimentoId, ssid: dto.ssid, ativo: true },
    });

    if (existe) {
      throw new ConflictException('SSID já cadastrado e ativo para este estabelecimento.');
    }

    return this.prisma.redeWifi.create({
      data: {
        ...dto,
        estabelecimentoId,
        validoDe: dto.validoDe ? new Date(dto.validoDe) : null,
        validoAte: dto.validoAte ? new Date(dto.validoAte) : null,
        ativo: true,
        criadoPor,
      },
    });
  }

  async listarWifis(estabelecimentoId: string, filtros: FiltrarWifiDto) {
    return this.prisma.redeWifi.findMany({
      where: {
        estabelecimentoId,
        ...(filtros.ativo !== undefined && { ativo: filtros.ativo }),
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async buscarWifiPorId(id: string, estabelecimentoId: string) {
    const network = await this.prisma.redeWifi.findFirst({
      where: { id, estabelecimentoId },
    });

    if (!network) {
      throw new NotFoundException('Rede Wi-Fi não localizada.');
    }

    return network;
  }

  async atualizarWifi(
    id: string,
    dto: AtualizarWifiDto,
    estabelecimentoId: string,
    atualizadoPor: string,
  ) {
    const network = await this.buscarWifiPorId(id, estabelecimentoId);

    if (dto.validoDe && dto.validoAte) {
      if (new Date(dto.validoAte) <= new Date(dto.validoDe)) {
        throw new BadRequestException('A data final deve ser posterior à data inicial.');
      }
    }

    return this.prisma.redeWifi.update({
      where: { id },
      data: {
        ...dto,
        ssid: network.ssid,
        validoDe: dto.validoDe ? new Date(dto.validoDe) : undefined,
        validoAte: dto.validoAte ? new Date(dto.validoAte) : undefined,
        atualizadoPor,
      },
    });
  }

  async alternarStatusWifi(
    id: string,
    estabelecimentoId: string,
    ativo: boolean,
    atualizadoPor: string,
  ) {
    await this.buscarWifiPorId(id, estabelecimentoId);

    return this.prisma.redeWifi.update({
      where: { id },
      data: { ativo, atualizadoPor },
      select: { id: true, displayName: true, ssid: true, isActive: true },
    });
  }

  async removerWifi(id: string, estabelecimentoId: string, deletadoPor: string) {
    await this.buscarWifiPorId(id, estabelecimentoId);

    await this.prisma.redeWifi.delete({ where: { id } });

    return { message: 'Rede Wi-Fi excluída com sucesso.' };
  }
}