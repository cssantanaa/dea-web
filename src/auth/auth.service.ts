// src/auth/auth.service.ts
import { Injectable,  UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { MudarSenhaDto } from './dto/mudar-senha.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // Busca em admins primeiro, depois em super_admins se houver tabela separada
    const admin = await this.prisma.administrador.findFirst({
      where: { usuario: dto.usuario },
    });

    if (!admin || !(await bcrypt.compare(dto.senha, admin.hashSenha))) {
      throw new UnauthorizedException('Nome de usuário ou senha incorretos. Verifique e tente novamente.');
    }

    if (!admin.ativo) {
      throw new ForbiddenException('Seu acesso está inativo ou bloqueado. Procure o administrador.');
    }

    const payload = {
      id: admin.id,
      usuario: admin.usuario,
      papelUsuario: 'admin',
      estabelecimentoId: admin.estabelecimentoId,
      permissoes: admin.permissoes,
    };

    return {
      access_token: this.jwt.sign(payload),
      exigirTrocaSenha: admin.exigirTrocaSenha,
      usuario: {
        id: admin.id,
        nome: admin.nome,
        usuario: admin.usuario,
        papelUsuario: 'admin',
        estabelecimentoId: admin.estabelecimentoId,
        permissoes: admin.permissoes,
      },
    };
  }

  async mudarSenha(userId: string, dto: MudarSenhaDto) {
    const admin = await this.prisma.administrador.findUnique({ where: { id: userId } });
    if (!admin) throw new UnauthorizedException('Usuário não encontrado.');

    const valid = await bcrypt.compare(dto.senhaAtual, admin.hashSenha);
    if (!valid) throw new BadRequestException('Senha atual incorreta.');

    if (dto.senhaAtual === dto.novaSenha) {
      throw new BadRequestException('A nova senha deve ser diferente da senha atual.');
    }

    const hashSenha = await bcrypt.hash(dto.novaSenha, 12);
    await this.prisma.administrador.update({
      where: { id: userId },
      data: { hashSenha: hashSenha, exigirTrocaSenha: false },
    });

    return { message: 'Senha alterada com sucesso. Faça login novamente.' };
  }

  async logout(userId: string) {
    // Invalidação de sessão no servidor — implementar blacklist de tokens se necessário
    return { message: 'Sessão encerrada.' };
  }
}