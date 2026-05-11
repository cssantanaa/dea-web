import { Module } from '@nestjs/common';
import { EstabelecimentosService } from './estabelecimentos.service';
import { EstabelecimentosController } from './estabelecimentos.controller';
// import { AuditModule } from '../audit/audit.module';

@Module({
    // imports: [AuditModule],
  providers: [EstabelecimentosService],
  controllers: [EstabelecimentosController],
  exports: [EstabelecimentosService],
})
export class EstabelecimentosModule {}
