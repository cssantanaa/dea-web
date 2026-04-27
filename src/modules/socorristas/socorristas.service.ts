import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { CriarSocorristaDto } from './dto/criar-socorristas.dto';
import { AtualizarSocorristaDto } from './dto/atualizar-socorristas.dto';
import { FiltrarSocorristasDto } from './dto/filtrar-socorristas.dto';
// import audit service when available


function gerarSenhaTemporaria(length = 12): string {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length }, () => letras[Math.floor(Math.random() * letras.length)]).join('');
}

const selecao_segura = {
  id: true,
  nome: true,
  usuario: true,
  telefoneSms: true,
  ativo: true,
  observacoes: true,
  ultimoLogin: true,
  criadoPor: true,
  criadoEm: true,
  atualizadoPor: true,
  atualizadoEm: true,
};

@Injectable()
export class SocorristasService {
  constructor(
    private prisma: PrismaService,
    // private audit: AuditService,
  ) {}

  async criar(dto: CriarSocorristaDto, estabelecimentoId: string, criadoPor: string) {
    const existe = await this.prisma.socorrista.findFirst({
      where: { usuario: dto.usuario, estabelecimentoId },
    });
    if (existe) throw new ConflictException('Usuário já em uso neste estabelecimento.');

    const senhaHash = await bcrypt.hash(dto.senha, 12);

    const socorrista = await this.prisma.socorrista.create({
      data: {
        estabelecimentoId,
        nome: dto.nome,
        usuario: dto.usuario,
        hashSenha : senhaHash ,
        telefone: dto.telefoneSms,
        observacoesInternas: dto.observacoes,
        ativo: true,
        criadoPor,
      },
      select: selecao_segura,
    });

    return socorrista;
  }

  async findAll(estabelecimentoId: string, filtros: FiltrarSocorristasDto) {
    return this.prisma.socorrista.findMany({
      where: {
        estabelecimentoId,
        ...(filtros.ativo !== undefined && { ativo: filtros.ativo }),
        ...(filtros.buscar && {
          nome: { contains: filtros.buscar, mode: 'insensitive' },
        }),
      },
      orderBy: { nome: 'asc' },
      select: selecao_segura,
    });
  }

  async findOne(id: string, estabelecimentoId: string) {
    const socorrista = await this.prisma.socorrista.findFirst({
      where: { id, estabelecimentoId: estabelecimentoId },
      select: selecao_segura,
    });
    if (!socorrista) throw new NotFoundException('Socorrista não localizado.');
    return socorrista;
  }

  async atualizar(id: string, dto: AtualizarSocorristaDto, estabelecimentoId: string, AtualizadoPor: string) {
    await this.findOne(id, estabelecimentoId);

    const atualizado = await this.prisma.socorrista.update({
      where: { id },
      data: { ...dto, atualizadoPor: AtualizadoPor },
      select: selecao_segura,
    });

    return atualizado;
  }

  async remover(id: string, estabelecimentoId: string, deletedBy: string) {
    await this.findOne(id, estabelecimentoId);

    // RF022: bloquear exclusão com ocorrências em aberto
    // Descomente quando a tabela de ocorrências estiver disponível:
    // const open = await this.prisma.occurrence.count({
    //   where: { responsibleRescuerId: id, status: { in: ['criada', 'em_atendimento'] } },
    // });
    // if (open > 0) {
    //   throw new BadRequestException(
    //     'Não é possível excluir um socorrista com ocorrências em aberto.',
    //   );
    // }

    await this.prisma.socorrista.delete({ where: { id } });

    return { message: 'Socorrista excluído com sucesso.' };
  }

  async resetarSenha(id: string, estabelecimentoId: string, solicitadoPor: string) {
    await this.findOne(id, estabelecimentoId);

    const senhaTemporaria = gerarSenhaTemporaria();
    const passwordHash = await bcrypt.hash(senhaTemporaria, 12);

    await this.prisma.socorrista.update({
      where: { id },
      data: { passwordHash, atualizadoPor: solicitadoPor },
    });

    return { senhaTemporaria };
  }

  async alternarAtivo(id: string, estabelecimentoId: string, ativo: boolean, atualizadoPor: string) {
    await this.findOne(id, estabelecimentoId);

    const atualizado = await this.prisma.socorrista.update({
      where: { id },
      data: { ativo, atualizadoPor },
      select: { id: true, ativo: true, usuario: true },
    });

    return atualizado;
  }
}