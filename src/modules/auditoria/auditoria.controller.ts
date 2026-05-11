import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuditoriaService } from './auditoria.service';
import { ConsultaAuditoriaDto } from './dto/consulta-auditoria.dto';
import { Usuario } from 'src/common/decorators/usuario.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private service: AuditoriaService) {}

  @Get()
  consultar(
    @Query() filtrosAuditoria: ConsultaAuditoriaDto,
    @Usuario() usuario: any,
    @Query('idEstabelecimento') idEstabelecimento?: string,
  ) {
    return this.service.consultar(
      filtrosAuditoria,
      usuario,
      idEstabelecimento,
    );
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string, @Usuario() usuario: any) {
    return this.service.buscarPorId(id, usuario);
  }
}