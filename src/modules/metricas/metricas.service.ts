import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { FiltrarMetricasDto } from './dto/filtrar-metricas.dto';

@Injectable()
export class MetricasService {
  constructor(private prisma: PrismaService) {}

  async query(
    estabelecimentoId: string,
    filtros: FiltrarMetricasDto,
    usuario: { role: string; estabelecimentoId: string; permissoes: string[] },
  ) {
    if (usuario.role === 'admin') {
      if (!usuario.permissoes.includes('consultar_metricas')) {
        throw new ForbiddenException(
          'Você não tem permissão para visualizar métricas deste estabelecimento.',
        );
      }

      if (usuario.estabelecimentoId !== estabelecimentoId) {
        throw new ForbiddenException('Acesso negado a este estabelecimento.');
      }
    }

    const dataInicio = new Date(filtros.periodoInicial);
    const dataFim = new Date(filtros.periodoFinal);

    if (dataFim <= dataInicio) {
      throw new BadRequestException(
        'A data final deve ser posterior à data inicial.',
      );
    }

    const [
      totalAcessosPublicos,
      totalOcorrencias,
      distribuicaoPorTipoDestino,
      totalOcorrenciasCanceladas,
      pontosAtivos,
      pontosInativos,
      barreirasAtivasPeriodo,
      bloqueiosAcesso,
    ] = await Promise.all([
      this.prisma.logAuditoria.count({
        where: {
          estabelecimentoId: estabelecimentoId,
          tipoEvento: { in: ['access.by_code', 'access.by_qr'] },
          dataRegistro: { gte: dataInicio, lte: dataFim },
        },
      }),

      Promise.resolve(0),

      this.prisma.poi.groupBy({
        by: ['tipo'],
        where: { estabelecimentoId: estabelecimentoId },
        _count: { id: true },
      }),

      Promise.resolve(0),

      this.prisma.poi.count({
        where: { estabelecimentoId: estabelecimentoId, availability: 'ativo' },
      }),

      this.prisma.poi.count({
        where: {
          estabelecimentoId: estabelecimentoId,
          disponibilidade: { in: ['inativo', 'em_manutencao'] },
        },
      }),

      this.prisma.barreira.count({
        where: {
          estabelecimentoId: estabelecimentoId,
          status: 'ativa',
          periodoInicial: { lte: dataFim },
          OR: [{ periodoFinal: null }, { periodoFinal: { gte: dataInicio } }],
        },
      }),

      this.prisma.logAuditoria.count({
        where: {
          estabelecimentoId: estabelecimentoId,
          resultado: 'falha',
          tipoEvento: { startsWith: 'access.' },
          dataRegistro: { gte: dataInicio, lte: dataFim },
        },
      }),
    ]);

    return {
      periodo: { inicio: dataInicio, fim: dataFim },

      totalAcessosPublicos,
      totalOcorrencias,

      tempoMedioRequisicaoSegundos: null,
      tempoMedioChegadaSegundos: null,

      distribuicaoPorTipoDestino: distribuicaoPorTipoDestino.map((d) => ({
        tipo: d.tipo,
        quantidade: d._count.id,
      })),

      taxaCancelamento:
        totalOcorrencias > 0
          ? (totalOcorrenciasCanceladas / totalOcorrencias) * 100
          : 0,

      disponibilidadePontos: {
        ativos: pontosAtivos,
        indisponiveis: pontosInativos,
      },

      barreirasAtivas: barreirasAtivasPeriodo,
      bloqueiosAcesso,
    };
  }

  private async calcularMediaSegundos(
    estabelecimentoId: string,
    dataInicio: Date,
    dataFim: Date,
    colunaInicio: string,
    colunaFim: string,
  ): Promise<number | null> {
    const resultado = await this.prisma.$queryRaw<
      { media_segundos: number | null }[]
    >`
      SELECT AVG(EXTRACT(EPOCH FROM (${colunaFim}::timestamptz - ${colunaInicio}::timestamptz)))
        AS media_segundos
        FROM occurrences
        WHERE establishment_id = ${estabelecimentoId}
        AND created_at BETWEEN ${dataInicio} AND ${dataFim}
        AND ${colunaFim} IS NOT NULL
    `;

    return resultado[0]?.media_segundos ?? null;
  }
}