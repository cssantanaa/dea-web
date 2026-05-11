import { Module } from '@nestjs/common';
import { BarreiraService } from './barreiras.service';
import { BarreiraController } from './barreiras.controller';
import { AgendadorBarreiras } from './barreiras.agendador';
import { EstabelecimentosModule } from '../estabelecimentos/estabelecimentos.module';
import { CodigosModule } from '../codigos/codigos.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
@Module({
  imports: [ AuditoriaModule, CodigosModule, EstabelecimentosModule],
  providers: [BarreiraService, AgendadorBarreiras],
  controllers: [BarreiraController],
  exports: [BarreiraService],
})
export class BarreirasModulo {}
