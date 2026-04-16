import { Controller, Post, Param, Body, UseGuards, Get, Query, Patch, Delete} from "@nestjs/common";
import { PoisService } from "./pois.service";
import { CriarPoiDto } from "./dto/poi.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { PermissionsGuard } from "src/auth/guards/permissions.guard";
import { Permissao } from "src/common/decorators/permissao.decorator";
import { Usuario } from "src/common/decorators/usuario.decorator";

@Controller('estabelecimentos/:estabelecimentoId/pois')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PoisController {
    constructor( private service: PoisService ) {}

    @Post()
    @Permissao('gerenciar_pois')
    create(@Param('estabelecimentoId') estabelecimentoId: string, @Body() dto: CriarPoiDto, @Usuario() user: any) {
        return this.service.create(dto, estabelecimentoId, user.userId);
    }

    @Get()
    findAll(@Param('estabelecimentoId') estabelecimentoId: string, @Query() filtros: any) {
        return this.service.findAll(estabelecimentoId, filtros);
    }

    @Get(':id')
    findOne(@Param('estabelecimentoId') estabelecimentoId: string, @Param('id') id: string) {
        return this.service.findOne(id, estabelecimentoId);
    }
    
    @Patch(':id')
    @Permissao('gerenciar_pois')
    update(@Param('estabelecimentoId') estabelecimentoId: string, @Param('id') id: string, @Body() dto: Partial<CriarPoiDto>, @Usuario() user: any) {
        return this.service.update(id, dto, estabelecimentoId, user.userId);
    }

    @Delete(':id')
    @Permissao('gerenciar_pois')
    remove(@Param('estabelecimentoId') estabelecimentoId: string, @Param('id') id: string) {
        return this.service.remove(id, estabelecimentoId);
    }
}


