import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateEstabelecimentosDto } from "./dto/create-estabelecimentos.dto";
import { CategoriaEstabelecimento } from "@prisma/client";

@Injectable()
export class EstabelecimentoService {
    constructor (
        private prisma: PrismaService,
        // private audit: AuditService,
    ) {}

    async create(dto: CreateEstabelecimentosDto, userId: string) {
        if (dto.tipoOperacao === 'evento') {
            if(!dto.dataInicioEvento || !dto.dataFimEvento) {
                throw new BadRequestException('Informe o início e fim do evento.');
            }

            if (new Date(dto.dataFimEvento) <= new Date(dto.dataInicioEvento)) {
                throw new BadRequestException('A data final deve ser posterior à data de início.');
            }
        }

        // const estabelecimento = await this.prisma.estabelecimento.create({
        //     data: {
        //         nome: dto.nome,
        //         clienteOrganizador: dto.clienteOrganizador,
        //         tipoOperacao: dto.tipoOperacao,
        //         dataInicioEvento: dto.dataInicioEvento ? new Date(dto.dataInicioEvento) : null,
        //         dataFimEvento: dto.dataFimEvento ? new Date(dto.dataFimEvento) : null,
        //         criador: userId,
        //     },
        // })

        // await this.audit.log({
        //     tipoUsuarioId: userId,
        //     tipoUsuario: 'super_admin',
        //     estabelecimentoId: estabelecimento.id,


        // })
    }
}