// import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
// import { PrismaService } from 'prisma/prisma.service';
// import { FiltrarMetricasDto } from './dto/filtrar-metricas.dto';


// @Injectable()
// export class MetricaService {
//   constructor(private prisma: PrismaService) {}

//   async query(
//     estabelecimentoId: string,
//     filtros: FiltrarMetricasDto,
//     user: { role: string; estabelecimentoId: string; permissoes: string[] },
//   ) {
//     // Admins só veem seu próprio estabelecimento
//     if (user.role === 'admin') {
//       if (!user.permissoes.includes('consultar_metricas')) {
//         throw new ForbiddenException('Você não tem permissão para visualizar métricas deste estabelecimento.');
//       }
//       if (user.estabelecimentoId !== estabelecimentoId) {
//         throw new ForbiddenException('Acesso negado a este estabelecimento.');
//       }
//     }

//     const inicio = new Date(filtros.periodoInicial);
//     const fim = new Date(filtros.periodoFinal);

//     if (fim <= inicio ) {
//       throw new BadRequestException('A data final deve ser posterior à data inicial.');
//     }

//     // ── Indicadores calculados em paralelo ─────────────────────────────────

//     const [
//       acessoPublicoTotal,
//       totalOcorrencias,
//       distribuicaoPorDestino,
//       ocorrenciasCanceladas,
//       poisAtivos,
//       poisInativos,
//       barreirasRecentes,
//       blocosAuditoria,
//     ] = await Promise.all([
//       // 1. Total acessos público — baseado em logs de auditoria de acesso
//       this.prisma.auditLog.count({
//         where: {
//           establishmentId,
//           eventType: { in: ['access.by_code', 'access.by_qr'] },
//           recordedAt: { gte: start, lte: end },
//         },
//       }),

//       // 2. Total ocorrências — tabela occurrences (criada no módulo do app mobile)
//       // Deixado como 0 até a tabela estar disponível
//       Promise.resolve(0),

//       // 3. Distribuição por tipo de destino
//       this.prisma.poi.groupBy({
//         by: ['type'],
//         where: { establishmentId },
//         _count: { id: true },
//       }),

//       // 4. Taxa de cancelamento — também depende da tabela occurrences
//       Promise.resolve(0),

//       // 5. POIs ativos
//       this.prisma.poi.count({
//         where: { establishmentId, availability: 'ativo' },
//       }),

//       // 6. POIs inativos/manutenção
//       this.prisma.poi.count({
//         where: {
//           establishmentId,
//           availability: { in: ['inativo', 'em_manutencao'] },
//         },
//       }),

//       // 7. Barreiras ativas no período
//       this.prisma.barrier.count({
//         where: {
//           establishmentId,
//           status: 'ativa',
//           periodStart: { lte: end },
//           OR: [{ periodEnd: null }, { periodEnd: { gte: start } }],
//         },
//       }),

//       // 8. Bloqueios de acesso (tentativas falhas no auditLog)
//       this.prisma.auditLog.count({
//         where: {
//           establishmentId,
//           result: 'falha',
//           eventType: { startsWith: 'access.' },
//           recordedAt: { gte: start, lte: end },
//         },
//       }),
//     ]);

//     // ── Médias de tempo (SQL nativo — requer tabela occurrences) ───────────
//     // Descomente quando occurrences estiver disponível:
//     // const avgClaimSeconds = await this.getAvgSeconds(
//     //   establishmentId, start, end, 'created_at', 'claim_at',
//     // );
//     // const avgArrivalSeconds = await this.getAvgSeconds(
//     //   establishmentId, start, end, 'claim_at', 'arrived_at',
//     // );

//     return {
//       period: { start: filters.periodStart, end: filters.periodEnd },
//       totalPublicAccesses,
//       totalOccurrences,
//       avgClaimTimeSeconds: null,   // disponível quando tabela occurrences existir
//       avgArrivalTimeSeconds: null,
//       distributionByDest: distributionByDest.map(d => ({
//         type: d.type,
//         count: d._count.id,
//       })),
//       cancellationRate: totalOccurrences > 0
//         ? (cancelledOccurrences / totalOccurrences) * 100
//         : 0,
//       poisAvailability: {
//         active: activePois,
//         unavailable: inactivePois,
//       },
//       activeBarriers: recentBarriers,
//       accessBlocks: auditBlocks,
//     };
//   }

//   // Helper para médias de tempo com SQL nativo (PostgreSQL)
//   private async getAvgSeconds(
//     establishmentId: string,
//     start: Date,
//     end: Date,
//     fromCol: string,
//     toCol: string,
//   ): Promise<number | null> {
//     const result = await this.prisma.$queryRaw<{ avg_seconds: number | null }[]>`
//       SELECT AVG(EXTRACT(EPOCH FROM (${toCol}::timestamptz - ${fromCol}::timestamptz)))
//         AS avg_seconds
//       FROM occurrences
//       WHERE establishment_id = ${establishmentId}
//         AND created_at BETWEEN ${start} AND ${end}
//         AND ${toCol} IS NOT NULL
//     `;
//     return result[0]?.avg_seconds ?? null;
//   }
// }
