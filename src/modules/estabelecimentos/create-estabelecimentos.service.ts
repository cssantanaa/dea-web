import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateEstabelecimentosDto } from "./dto/create-estabelecimentos.dto";
import { CategoriaEstabelecimento } from "@prisma/client";

@Injectable()
export class EstabelecimentoService {
    constructor ( private prisma: PrismaService) {}

    async create(dto: CreateEstabelecimentosDto, userId: string) {
        if (dto.tipoOperacao === 'evento') {
            if(!dto.dataInicioEvento || !dto.dataFimEvento) {
                throw new BadRequestException('Informe o início e fim do evento.');
            }

            if (new Date(dto.dataFimEvento) <= new Date(dto.dataInicioEvento)) {
                throw new BadRequestException('A data final deve ser posterior à data de início.');
            }
        }
    }

    async findAll(filters: { status?: statusEstabelecimento; categoria?: string }) {
        return this.prisma.estabelecimento.findMany({
            where: {
                ...(filters.status ? { status: filters.status } : {}),
                ...(filters.categoria ? { categoriaEstabelecimento: filters.categoria as CategoriaEstabelecimento } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const e = await this.prisma.estabelecimento.findUnique({ where: { id } });
        if (!e) throw new BadRequestException('Estabelecimento não encontrado.'); 
        return e;
    }

    async update(id: string, dto: Partial<CreateEstabelecimentosDto>, userId: string) {
        await this.findOne(id); // Verifica se o estabelecimento existe
        return this.prisma.estabelecimento.update({
            where: { id }, 
            data: {...dto, 
                dataInicioEvento: dto.dataInicioEvento ? new Date(dto.dataInicioEvento) : undefined, 
                dataFimEvento: dto.dataFimEvento ? new Date(dto.dataFimEvento) : undefined, 
                atualizadoPor: userId 
            } 
        });
    }

    async setStatus(id: string, status: statusEstabelecimento, userId: string) {
        await this.findOne(id);
        const updated = await this.prisma.estabelecimento.update({
            where: { id }, 
            data: { status, atualizadoPor: userId } 
        });
        return updated;
    }

    async closeExpiredEvents() {
        return this.prisma.estabelecimento.updateMany({
            where: {
                tipoOperacao: 'evento',
                dataFimEvento: { lt: new Date() },
                status: 'ativo',
            },
            data: { status: 'inativo', atualizadoPor: 'system' }
        });
    }
}