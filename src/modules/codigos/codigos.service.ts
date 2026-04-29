// import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
// import * as QRCode from 'qrcode';
// import { PrismaService } from 'prisma/prisma.service';
// import { CriarCodigoDto, CriarCodigoAutomaticoDto } from './dto/codigos.dto';
// import { StatusCodigo } from '@prisma/client';

// @Injectable()
// export class CodigosService {
//   constructor(
//     private prisma: PrismaService,
//         // private audit: AuditService,
//   ) {}

//   async create(dto: CriarCodigoDto, estabelecimentoId: string, criadoPor: string) {
//     if (dto.validoDe && dto.validoAte) {
//       if (new Date(dto.validoAte) <= new Date(dto.validoDe)) {
//         throw new BadRequestException('A data final deve ser posterior à data inicial.');
//       }
//     }

//     let codigo: string;
//     if (dto.modoGeracao === 'manual') {
//       if (!dto.codigo) {
//         throw new BadRequestException('Informe o valor do código no modo manual.');
//       }
//       const dup = await this.prisma.codigoAcesso.findUnique({
//         where: {
//           estabelecimentoId_codigo: { estabelecimentoId, codigo: dto.codigo },
//         },
//       });
//       if (dup) throw new ConflictException('Código já utilizado neste estabelecimento.');
//       codigo = dto.codigo;
//     } else {
//       codigo = await this.generateUniqueCode(estabelecimentoId);
//     }

//     const currentActive = await this.prisma.codigoAcesso.findFirst({
//       where: { estabelecimentoId, status: 'ativo' },
//       select: { id: true, codigo: true },
//     });

//     // Se já existe um código ativo, sinaliza ao controller para pedir confirmação
//     if (currentActive) {
//       return {
//         requiresConfirmation: true,
//         currentActiveId: currentActive.id,
//         currentActiveCode: currentActive.codigo,
//         pendingCode: codigo,
//       };
//     }

//     return this.persistCode(codigo, dto, estabelecimentoId, criadoPor, 'ativo');
//   }

//   async confirmReplace(dto: CriarCodigoAutomaticoDto, estabelecimentoId: string, createdBy: string) {
//     const current = await this.prisma.codigoAcesso.findFirst({
//       where: { id: dto.id, estabelecimentoId: estabelecimentoId, status: 'ativo' },
//     });
//     if (!current) throw new NotFoundException('Código ativo atual não encontrado.');

//     return this.prisma.$transaction(async tx => {
//       await tx.codigoAcesso.update({
//         where: { id: dto.id },
//         data: { status: 'revogado', updatedBy: createdBy },
//       });
//       const created = await this.persistCodeTx(tx, dto.codigo, dto, estabelecimentoId, createdBy, 'ativo');

//       return created;
//     });
//   }

//   async createAsRevoked(dto: CriarCodigoDto, estabelecimentoId: string, criadoPor: string) {
//     let codeValue: string;
//     if (dto.modoGeracao === 'manual' && dto.codigo) {
//       codeValue = dto.codigo;
//     } else {
//       codeValue = await this.generateUniqueCode(estabelecimentoId);
//     }
//     return this.persistCode(codeValue, dto, estabelecimentoId, criadoPor, 'revogado');
//   }

//   async revoke(id: string, estabelecimentoId: string, revokedBy: string) {
//     const code = await this.prisma.codigoAcesso.findFirst({ where: { id, estabelecimentoId } });
//     if (!code) throw new NotFoundException('Código não localizado.');
//     if (code.status !== 'ativo') {
//       throw new BadRequestException('Somente códigos ativos podem ser revogados.');
//     }

//     const updated = await this.prisma.codigoAcesso.update({
//       where: { id },
//       data: { status: 'revogado', updatedBy: revokedBy },
//     });

//     return updated;
//   }

//   async reactivate(id: string, estabelecimentoId: string, reativadoPor: string) {
//     const code = await this.prisma.codigoAcesso.findFirst({ where: { id, estabelecimentoId } });
//     if (!code) throw new NotFoundException('Código não localizado.');

//     // RF023: código expirado NÃO pode ser reativado
//     if (code.status === 'expirado') {
//       throw new BadRequestException(
//         'Este código está expirado e não pode ser reativado. Crie um novo código.',
//       );
//     }
//     if (code.status === 'ativo') {
//       throw new BadRequestException('Este código já está ativo.');
//     }

//     // Revogar qualquer outro código ativo antes de reativar
//     await this.prisma.codigoAcesso.updateMany({
//       where: { estabelecimentoId, status: 'ativo' },
//       data: { status: 'revogado', atualizadoPor: reativadoPor },
//     });

//     const updated = await this.prisma.codigoAcesso.update({
//       where: { id },
//       data: { status: 'ativo', atualizadoPor: reativadoPor },
//     });

//     return updated;
//   }

//   async getQrData(id: string, estabelecimentoId: string) {
//     const code = await this.prisma.codigoAcesso.findFirst({
//       where: { id, estabelecimentoId, status: 'ativo' },
//     });
//     if (!code?.imagemQr) throw new NotFoundException('QR Code não disponível para este código.');
//     return { qrImageData: code.imagemQr, codeValue: code.codigo };
//   }

//   async findAll(estabelecimentoId: string) {
//     return this.prisma.codigoAcesso.findMany({
//       where: { estabelecimentoId },
//       orderBy: { criadoEm: 'desc' },
//       select: {
//         id: true,
//         codeValue: true,
//         status: true,
//         generationMode: true,
//         description: true,
//         validFrom: true,
//         validUntil: true,
//         generateQr: true,
//         createdBy: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });
//   }

//   // Chamado pelo CRON scheduler
//   async expireOldCodes() {
//     return this.prisma.codigoAcesso.updateMany({
//       where: {
//         status: 'ativo',
//         validUntil: { lt: new Date() },
//       },
//       data: { status: 'expirado' },
//     });
//   }

//   // ── Helpers privados ─────────────────────────────────────

//   private async persistCode(
//     codeValue: string,
//     dto: CriarCodigoDto | CriarCodigoAutomaticoDto,
//     estabelecimentoId: string,
//     criadoPor: string,
//     status: CodeStatus,
//   ) {
//     let qrImageData: string | undefined;
//     if ((dto as CreateCodeDto).generateQr !== false) {
//       qrImageData = await QRCode.toDataURL(codeValue, { errorCorrectionLevel: 'H' });
//     }

//     const created = await this.prisma.codigoAcesso.create({
//       data: {
//         estabelecimentoId,
//         codeValue,
//         generationMode: (dto as CreateCodeDto).generationMode ?? 'automatico',
//         description: dto.description,
//         validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
//         validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
//         status,
//         generateQr: (dto as CreateCodeDto).generateQr !== false,
//         qrImageData,
//         createdBy,
//       },
//     });

//     return created;
//   }

//   private async persistCodeTx(
//     tx: any,
//     codeValue: string,
//     dto: ConfirmReplaceDto,
//     establishmentId: string,
//     createdBy: string,
//     status: CodeStatus,
//   ) {
//     let qrImageData: string | undefined;
//     if (dto.generateQr !== false) {
//       qrImageData = await QRCode.toDataURL(codeValue, { errorCorrectionLevel: 'H' });
//     }

//     return tx.accessCode.create({
//       data: {
//         estabelecimentoId,
//         codigo: codigo,
//         generationMode: 'manual',
//         description: dto.description,
//         validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
//         validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
//         status,
//         generateQr: dto.generateQr !== false,
//         qrImageData,
//         createdBy,
//       },
//     });
//   }

//   private async generateUniqueCode(estabe: string): Promise<string> {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     for (let attempt = 0; attempt < 10; attempt++) {
//       const candidate = Array.from({ length: 6 }, () =>
//         chars[Math.floor(Math.random() * chars.length)],
//       ).join('');

//       const exists = await this.prisma.codigoAcesso.findUnique({
//         where: { estabelecimentoId_codigo: { estabelecimentoId: estabelecimentoId, codigo: candidate } },
//       });
//       if (!exists) return candidate;
//     }
//     throw new BadRequestException('Não foi possível gerar um código único. Tente novamente.');
//   }
// }