// import {
//   Injectable,
//   BadRequestException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';
// import { AuditQueryDto } from './dto/audit-query.dto';

// export interface LogDto {
//   responsibleUserId?: string;
//   responsibleUserRole?: string;
//   establishmentId?: string;
//   eventType: string;
//   affectedResource: string;
//   affectedResourceId?: string;
//   result?: 'sucesso' | 'falha';
//   requestOrigin?: string;
//   metadata?: object;
// }

// @Injectable()
// export class AuditService {
//   constructor(private prisma: PrismaService) {}

//   // Fire-and-forget — nunca bloqueia o fluxo principal da requisição
//   log(dto: LogDto): void {
//     this.prisma.auditLog
//       .create({
//         data: {
//           responsibleUserId: dto.responsibleUserId,
//           responsibleUserRole: dto.responsibleUserRole,
//           establishmentId: dto.establishmentId,
//           eventType: dto.eventType,
//           affectedResource: dto.affectedResource,
//           affectedResourceId: dto.affectedResourceId,
//           result: dto.result ?? 'sucesso',
//           requestOrigin: dto.requestOrigin,
//           metadata: dto.metadata as any,
//         },
//       })
//       .catch(err => console.error('[AuditService] Falha ao registrar log:', err));
//   }

//   async query(
//     filters: AuditQueryDto,
//     user: { role: string; establishmentId: string; permissions?: string[] },
//     targetEstablishmentId?: string,
//   ) {
//     if (new Date(filters.periodEnd) <= new Date(filters.periodStart)) {
//       throw new BadRequestException('A data final deve ser posterior à data inicial.');
//     }

//     // Admin só pode ver o próprio estabelecimento e precisa de permissão
//     if (user.role === 'admin') {
//       if (!user.permissions?.includes('consultar_historico')) {
//         throw new ForbiddenException('Você não tem permissão para visualizar estes registros.');
//       }
//       // Ignora targetEstablishmentId e força o próprio
//       targetEstablishmentId = user.establishmentId;
//     }

//     const page = filters.page ?? 1;
//     const limit = filters.limit ?? 50;
//     const skip = (page - 1) * limit;

//     const where: any = {
//       recordedAt: {
//         gte: new Date(filters.periodStart),
//         lte: new Date(filters.periodEnd),
//       },
//       ...(targetEstablishmentId && { establishmentId: targetEstablishmentId }),
//       ...(filters.responsibleUserRole && {
//         responsibleUserRole: filters.responsibleUserRole,
//       }),
//       ...(filters.eventType && {
//         eventType: { contains: filters.eventType },
//       }),
//       ...(filters.affectedResource && {
//         affectedResource: filters.affectedResource,
//       }),
//       ...(filters.result && { result: filters.result }),
//     };

//     const [records, total] = await Promise.all([
//       this.prisma.auditLog.findMany({
//         where,
//         orderBy: { recordedAt: 'desc' },
//         skip,
//         take: limit,
//         // RF027: nunca expõe senhas, tokens, imagens ou dados sensíveis
//         select: {
//           id: true,
//           recordedAt: true,
//           responsibleUserId: true,
//           responsibleUserRole: true,
//           establishmentId: true,
//           eventType: true,
//           affectedResource: true,
//           affectedResourceId: true,
//           result: true,
//           requestOrigin: true,
//           // metadata é omitido na listagem — disponível somente no detalhe
//         },
//       }),
//       this.prisma.auditLog.count({ where }),
//     ]);

//     return {
//       data: records,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   async findOne(id: string, user: { role: string; establishmentId: string; permissions?: string[] }) {
//     if (user.role === 'admin' && !user.permissions?.includes('consultar_historico')) {
//       throw new ForbiddenException('Você não tem permissão para visualizar estes registros.');
//     }

//     const log = await this.prisma.auditLog.findUnique({ where: { id } });
//     if (!log) {
//       throw new BadRequestException('Registro não localizado.');
//     }

//     // Admin não pode ver registros de outros estabelecimentos
//     if (user.role === 'admin' && log.establishmentId !== user.establishmentId) {
//       throw new ForbiddenException('Acesso negado a este registro.');
//     }

//     return log;
//   }
// }
