import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { EstabelecimentoService } from "./create-estabelecimentos.service";
import { CreateEstabelecimentosDto } from "./dto/create-estabelecimentos.dto";
import { Body, Post, Param } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { TipoUsuarioGuard } from "src/auth/guards/tipo-usuario.guard";
import { TipoUsuario } from "src/common/decorators/tipos.decorator";
import { Usuario } from "src/common/decorators/usuario.decorator";

@Controller('estabelecimentos')
@UseGuards(JwtAuthGuard, TipoUsuarioGuard)
@TipoUsuario(['super_admin'])
export class EstabelecimentosController {
    constructor( private service: EstabelecimentoService ) {}

    @Post()
    create(@Body() dto: CreateEstabelecimentosDto, @Usuario() userId: any) {
        return this.service.create(dto, userId);
    }

    // @Get()
    // findAll(@Query() filters: { status?: any; categoria?: string }) {
    //     return this.service.findAll(filters);
    // }

    // @Get(':id')
    // findOne(@Param('id') id: string) {
    //     return this.service.findOne(id);
    // }
}