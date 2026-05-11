import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ConsultaAuditoriaDto } from './dto/consulta-auditoria.dto';

export interface LogAuditoriaDto {
  idUsuarioResponsavel?: string;
  papelUsuarioResponsavel?: string;
  idEstabelecimento?: string;
  tipoEvento: string;
  recursoAfetado: string;
  idRecursoAfetado?: string;
  resultado?: 'sucesso' | 'falha';
  origemRequisicao?: string;
  metadados?: object;
}

@Injectable()
export class AuditoriaService {
  constructor(private prisma: PrismaService) {}

  // Fire-and-forget — nunca bloqueia o fluxo principal da requisição
  registrarLog(dto: LogAuditoriaDto): void {
    this.prisma.logAuditoria.create({
        data: {
          usuarioResponsavelId: dto.idUsuarioResponsavel,
          papelUsuarioResponsavel: dto.papelUsuarioResponsavel,
          estabelecimentoId: dto.idEstabelecimento,
          tipoEvento: dto.tipoEvento,
          recursoAfetado: dto.recursoAfetado,
          idRecursoAfetado: dto.idRecursoAfetado,
          resultado: dto.resultado ?? 'sucesso',
          origemRequisicao: dto.origemRequisicao,
          metadados: dto.metadados as any,
        },
      })
      .catch(err =>
        console.error('[AuditService] Falha ao registrar log:', err),
      );
  }

  async consultar(
    filtrosAuditoria: ConsultaAuditoriaDto,
    usuario: {
      papel: string;
      estabelecimentoId: string;
      permissoes?: string[];
    },
    idEstabelecimentoAlvo?: string,
  ) {
    if (
      new Date(filtrosAuditoria.periodoFim) <=
      new Date(filtrosAuditoria.periodoInicio)
    ) {
      throw new BadRequestException(
        'A data final deve ser posterior à data inicial.',
      );
    }

    if (usuario.papel === 'admin') {
      if (!usuario.permissoes?.includes('consultar_historico')) {
        throw new ForbiddenException(
          'Você não tem permissão para visualizar estes registros.',
        );
      }

      idEstabelecimentoAlvo = usuario.estabelecimentoId;
    }

    const pagina = filtrosAuditoria.pagina ?? 1;
    const limite = filtrosAuditoria.limite ?? 50;
    const pular = (pagina - 1) * limite;

    const condicao: any = {
      recordedAt: {
        gte: new Date(filtrosAuditoria.periodoInicio),
        lte: new Date(filtrosAuditoria.periodoFim),
      },
      ...(idEstabelecimentoAlvo && {
        estabelecimentoId: idEstabelecimentoAlvo,
      }),
      ...(filtrosAuditoria.papelUsuarioResponsavel && {
        papelUsuarioResponsavel: filtrosAuditoria.papelUsuarioResponsavel,
      }),
      ...(filtrosAuditoria.tipoEvento && {
        tipoEvento: { contains: filtrosAuditoria.tipoEvento },
      }),
      ...(filtrosAuditoria.recursoAfetado && {
        recursoAfetado: filtrosAuditoria.recursoAfetado,
      }),
      ...(filtrosAuditoria.resultado && {
        resultado: filtrosAuditoria.resultado,
      }),
    };

    const [registros, total] = await Promise.all([
      this.prisma.logAuditoria.findMany({
        where: condicao,
        orderBy: { registradoEm: 'desc' },
        skip: pular,
        take: limite,
        select: {
          id: true,
          registradoEm: true,
          usuarioResponsavelId: true,
          papelUsuarioResponsavel: true,
          estabelecimentoId: true,
          tipoEvento: true,
          recursoAfetado: true,
          idRecursoAfetado: true,
          resultado: true,
          origemRequisicao: true,
          metadados: true,
        },
      }),
      this.prisma.logAuditoria.count({ where: condicao }),
    ]);

    return {
      dados: registros,
      meta: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  async buscarPorId(
    id: string,
    usuario: {
      papel: string;
      estabelecimentoId: string;
      permissoes?: string[];
    },
  ) {
    if (
      usuario.papel === 'admin' &&
      !usuario.permissoes?.includes('consultar_historico')
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para visualizar estes registros.',
      );
    }

    const registro = await this.prisma.logAuditoria.findUnique({
      where: { id },
    });

    if (!registro) {
      throw new BadRequestException('Registro não localizado.');
    }

    if (
      usuario.papel === 'admin' &&
      registro.estabelecimentoId !== usuario.estabelecimentoId
    ) {
      throw new ForbiddenException('Acesso negado a este registro.');
    }

    return registro;
  }
}