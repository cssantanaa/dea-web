import { Module } from '@nestjs/common';
import { SocorristasService } from './socorristas.service';
import { SocorristasController } from './socorristas.controller';
// import { AuditModule } from '../audit/audit.module';

@Module({
  // imports: [AuditModule],
  providers: [SocorristasService],
  controllers: [SocorristasController],
  exports: [SocorristasService],
})
export class SocorristasModule {}
