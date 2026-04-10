import { Controller, Get, Patch, Query, UseGuards } from "@nestjs/common";
import { EstabelecimentoService } from "./estabelecimentos.service";
import { CriarEstabelecimentosDto } from "./dto/estabelecimentos.dto";
import { Body, Post, Param } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { TipoUsuarioGuard } from "src/auth/guards/tipo-usuario.guard";
import { TipoUsuario } from "src/common/decorators/tipos.decorator";
import { Usuario } from "src/common/decorators/usuario.decorator";
import { StatusEstabelecimento } from "@prisma/client";

@Controller('estabelecimentos')
@UseGuards(JwtAuthGuard, TipoUsuarioGuard)
@TipoUsuario(['super_admin'])
export class EstabelecimentosController {
    constructor( private service: EstabelecimentoService ) {}

    @Post()
    create(@Body() dto: CriarEstabelecimentosDto, @Usuario() userId: any) {
        return this.service.create(dto, userId);
    }

    @Get()
    findAll(@Query() filters: { status?: any; categoria?: string }) {
        return this.service.findAll(filters);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: Partial<CriarEstabelecimentosDto>, @Usuario() user: any,) {
        return this.service.update(id, dto, user.userId);
    }

    @Patch(':id/status')
    setStatus(@Param('id') id: string, @Body('status') status: any, @Usuario() user: any) {
        return this.service.setStatus(id, status, user.userId);
    }
}