import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CriarWifiDto } from './dto/criar-wifi.dto';
import { AtualizarWifiDto } from './dto/atualizar-wifi.dto';
import { FiltrarWifiDto } from './dto/filtrar-wifi.dto';
// import { AuditService } from '../audit/audit.service';

@Injectable()
export class WifiService {
  constructor(
    private prisma: PrismaService,
    // private audit: AuditService,
  ) {}

  async create(dto: CriarWifiDto, estabelecimentoId: string, criadoPor: string) {
    if (dto.validoDe && dto.validoAte) {
      if (new Date(dto.validoAte) <= new Date(dto.validoDe)) {
        throw new BadRequestException('A data final deve ser posterior à data inicial.');
      }
    }

    // RF024: unicidade por SSID no mesmo estabelecimento enquanto ativa no período
    const existe = await this.prisma.redeWifi.findFirst({
      where: { estabelecimentoId, ssid: dto.ssid, ativo: true },
    });
    if (existe) {
      throw new ConflictException('SSID já cadastrado e ativo para este estabelecimento.');
    }

    const rede = await this.prisma.redeWifi.create({
      data: {
        ...dto,
        estabelecimentoId,
        validoDe: dto.validoDe ? new Date(dto.validoDe) : null,
        validoAte: dto.validoAte ? new Date(dto.validoAte) : null,
        ativo: true,
        criadoPor,
      },
    });

    // await this.audit.log({
    //   responsibleUserId: createdBy,
    //   establishmentId,
    //   eventType: 'wifi.created',
    //   affectedResource: 'wifi_network',
    //   affectedResourceId: network.id,
    // });

    return rede;
  }

  async findAll(estabelecimentoId: string, filtros: FiltrarWifiDto) {
    return this.prisma.redeWifi.findMany({
      where: {
        estabelecimentoId,
        ...(filtros.ativo !== undefined && { ativo: filtros.ativo }),
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findOne(id: string, estabelecimentoId: string) {
    const network = await this.prisma.redeWifi.findFirst({
      where: { id, estabelecimentoId },
    });
    if (!network) throw new NotFoundException('Rede Wi-Fi não localizada.');
    return network;
  }

  async update(id: string, dto: AtualizarWifiDto, estabelecimentoId: string, atualizadoPor: string) {
    const network = await this.findOne(id, estabelecimentoId);

    if (dto.validoDe && dto.validoAte) {
      if (new Date(dto.validoAte) <= new Date(dto.validoDe)) {
        throw new BadRequestException('A data final deve ser posterior à data inicial.');
      }
    }

    // RF024: SSID não pode ser alterado após criação
    // (ssid não está no UpdateWifiDto, então essa verificação é uma segurança extra)
    const updated = await this.prisma.redeWifi.update({
      where: { id },
      data: {
        ...dto,
        ssid: network.ssid, // garante imutabilidade
        validoDe: dto.validoDe ? new Date(dto.validoDe) : undefined,
        validoAte: dto.validoAte ? new Date(dto.validoAte) : undefined,
        atualizadoPor,
      },
    });

    // await this.audit.log({
    //   responsibleUserId: updatedBy,
    //   establishmentId,
    //   eventType: 'wifi.updated',
    //   affectedResource: 'wifi_network',
    //   affectedResourceId: id,
    // });

    return updated;
  }

  async toggleActive(id: string, estabelecimentoId: string, ativo: boolean, atualizadoPor: string) {
    await this.findOne(id, estabelecimentoId);

    const updated = await this.prisma.redeWifi.update({
      where: { id },
      data: { ativo, atualizadoPor },
      select: { id: true, displayName: true, ssid: true, isActive: true },
    });

    // await this.audit.log({
    //   responsibleUserId: updatedBy,
    //   establishmentId,
    //   eventType: isActive ? 'wifi.reactivated' : 'wifi.deactivated',
    //   affectedResource: 'wifi_network',
    //   affectedResourceId: id,
    // });

    return updated;
  }

  async remove(id: string, estabelecimentoId: string, deletadoPor: string) {
    await this.findOne(id, estabelecimentoId);

    await this.prisma.redeWifi.delete({ where: { id } });

    // await this.audit.log({
    //   responsibleUserId: deletedBy,
    //   establishmentId,
    //   eventType: 'wifi.deleted',
    //   affectedResource: 'wifi_network',
    //   affectedResourceId: id,
    // });

    return { message: 'Rede Wi-Fi excluída com sucesso.' };
  }
}