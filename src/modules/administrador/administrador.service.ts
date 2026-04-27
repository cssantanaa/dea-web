import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { CriarAdministradorDto } from './dto/criar-administrador.dto';
import { AtualizarAdministradorDto } from './dto/atualizar-administrador.dto';
import { FiltrarAdminDto } from './dto/filtrar-admin.dto';
import { AlternarAtivoDto } from './dto/alternar-ativo.dto';


function generateTempPassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const selecao_segura = {
  id: true,
  name: true,
  username: true,
  smsPhone: true,
  establishmentId: true,
  isActive: true,
  permissions: true,
  requirePasswordChange: true,
  internalNotes: true,
  createdBy: true,
  createdAt: true,
  updatedBy: true,
  updatedAt: true,
};

@Injectable()
export class AdminsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async criar(dto: CriarAdministradorDto, createdBy: string) {
    // Valida se o estabelecimento existe
    const estabelecimento = await this.prisma.estabelecimento.findUnique({
      where: { id: dto.estabelecimentoId },
    });
    if (!estabelecimento) {
      throw new BadRequestException('Estabelecimento inválido para gestão de administradores.');
    }
    if (estabelecimento.status === 'encerrado') {
      throw new BadRequestException('Estabelecimento encerrado não pode ter novos administradores.');
    }

    const existe = await this.prisma.administrador.findFirst({
      where: { usuario: dto.usuario, estabelecimentoId: dto.estabelecimentoId },
    });
    if (existe) throw new ConflictException('Usuário já em uso neste estabelecimento.');

    const hashSenha = await bcrypt.hash(dto.senhaInicial, 12);

    const admin = await this.prisma.administrador.create({
      data: {
        estabelecimentoId: dto.estabelecimentoId,
        nome: dto.nome,
        usuario: dto.usuario,
        hashSenha: hashSenha,
        telefoneSms: dto.telefone,
        permissoes: dto.permissoes,
        exigirTrocaSenha: true,
        ativo: true,
        observacoesInternas: dto.observacoes,
        criadoPor: createdBy,
      },
      select: selecao_segura,
    });

    return admin;
  }

  async findAll(estabelecimentoId: string, filtros: FiltrarAdminDto) {
    return this.prisma.administrador.findMany({
      where: {
        estabelecimentoId: estabelecimentoId,
        ...(filtros.ativo !== undefined && { ativo: filtros.ativo }),
        ...(filtros.buscar && {
          nome: { contains: filtros.buscar, mode: 'insensitive' },
        }),
      },
      orderBy: { criadoEm: 'desc' },
      select: selecao_segura,
    });
  }

  async findOne(id: string) {
    const admin = await this.prisma.administrador.findUnique({
      where: { id },
      select: selecao_segura,
    });
    if (!admin) throw new NotFoundException('Administrador não localizado.');
    return admin;
  }

  async atualizar(id: string, dto: AtualizarAdministradorDto, updatedBy: string) {
    const admin = await this.prisma.administrador.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Administrador não localizado.');

    const updated = await this.prisma.administrador.update({
      where: { id },
      data: { ...dto, updatedBy },
      select: selecao_segura,
    });

    return updated;
  }

  async remover(id: string, deletedBy: string) {
    const admin = await this.prisma.administrador.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Administrador não localizado.');

    await this.prisma.administrador.delete({ where: { id } });

    return { message: 'Administrador excluído com sucesso.' };
  }

  async resetarSenha(id: string, requestedBy: string) {
    const admin = await this.prisma.administrador.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Administrador não localizado.');

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await this.prisma.administrador.update({
      where: { id },
      data: { hashSenha: passwordHash, exigirTrocaSenha: true, updatedBy: requestedBy },
    });


    // tempPassword exibido uma única vez — não armazenar em log
    return { tempPassword };
  }

  async alternarAtivo(id: string, isActive: boolean, updatedBy: string) {
    const admin = await this.prisma.administrador.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Administrador não localizado.');

    const updated = await this.prisma.administrador.update({
      where: { id },
      data: { ativo: isActive, updatedBy },
      select: { id: true, ativo: true, usuario: true },
    });

    return updated;
  }
}