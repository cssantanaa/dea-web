import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CriarAdministradorDto } from "./dto/administrador.dto";
import * as bcrypt from 'bcrypt';

function generateTempPassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CriarAdministradorDto, criadoPor: string) {
    const existe = await this.prisma.administrador.findFirst({
      where: { usuario: dto.usuario, estabelecimentoId: dto.estabelecimentoId },
    });
    if (existe) throw new ConflictException('Usuário já em uso neste estabelecimento.');

    const hashSenha = await bcrypt.hash(dto.senhaInicial, 12);

    return this.prisma.administrador.create({
      data: {
        ...dto,
        hashSenha,
        exigirTrocaSenha: true,
        ativo: true,
        criadoEm: new Date(),
      },
      // Nunca retornar o hash
      select: {
        id: true, nome: true, usuario: true, telefoneSms: true,
        estabelecimentoId: true, ativo: true, permissoes: true,
        exigirTrocaSenha: true, criadoEm: true,
      },
    });
  }

  async findAll(estabelecimentoId: string) {
    return this.prisma.administrador.findMany({
      where: { estabelecimentoId },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true, nome: true, usuario: true, telefoneSms: true,
        ativo: true, permissoes: true, criadoEm: true, updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const administrador = await this.prisma.administrador.findUnique({ where: { id } });
    if (!administrador) throw new NotFoundException('Administrador não localizado.');
    return administrador;
  }

  async update(id: string, dto: Partial<CriarAdministradorDto>, updatedBy: string) {
    const administrador = await this.findOne(id);
    if (dto.usuario && dto.usuario !== administrador.usuario) {
      throw new BadRequestException('O identificador de usuário não pode ser alterado após a criação.');
    }
    return this.prisma.administrador.update({
      where: { id },
      data: { ...dto, usuario: administrador.usuario, updatedBy },
      select: {
        id: true, nome: true, usuario: true, telefoneSms: true,
        ativo: true, permissoes: true, updatedAt: true,
      },
    });
  }

  async novaSenha(id: string, requestedBy: string) {
    await this.findOne(id);
    const tempPassword = generateTempPassword();
    const hashSenha = await bcrypt.hash(tempPassword, 12);
    await this.prisma.administrador.update({
      where: { id },
      data: { hashSenha, exigirTrocaSenha: true, updatedBy: requestedBy },
    });
    return { tempPassword }; // exibido uma única vez
  }

  async setStatus(id: string, ativo: boolean, updatedBy: string) {
    await this.findOne(id);
    return this.prisma.administrador.update({
      where: { id },
      data: { ativo, updatedBy },
      select: { id: true, ativo: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.administrador.delete({ where: { id } });
  }
}