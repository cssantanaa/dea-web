import { Module } from '@nestjs/common';
import { CodigosService } from './codigos.service';
import { CodigosController } from './codigos.controller';
// import { AuditModule } from '../audit/audit.module';

@Module({
  // imports: [AuditModule],
  providers: [CodigosService],
  controllers: [CodigosController],
  exports: [CodigosService],
})
export class CodigosModule {}
