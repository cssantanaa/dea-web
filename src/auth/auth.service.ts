import { ForbiddenException } from '@nestjs/common';
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor( private prisma: PrismaService, private jwt: JwtService) {}

    async login(dto: LoginDto) {
        const admin = await this.prisma.administrador.findFirst({
            where: { usuario: dto.usuario }
        });

        if (!admin || !(await bcrypt.compare(dto.senha, admin.hashSenha))) {
            throw new Error('Nome de usuário ou senha inválidos.');
        }
        if(!admin.ativo) {
            throw new Error('Sua conta está inativa. Entre em contato com o administrador.');
        }

        const payload = { sub: admin.id, usuario: admin.usuario, tipo: 'super_admin', permissao: admin.permissoes, };

        return{
            acesso_token: this.jwt.sign(payload),
            exigirTrocaSenha: admin.exigirTrocaSenha,
        }

    }
}