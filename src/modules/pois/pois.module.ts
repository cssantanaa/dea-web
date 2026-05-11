import { Module } from '@nestjs/common';
import { PoisService } from './pois.service';
import { PoisController } from './pois.controller';
// import { AuditModule } from '../audit/audit.module';

@Module({
  // imports: [AuditModule],
  providers: [PoisService],
  controllers: [PoisController],
  exports: [PoisService],
})
export class PoisModule {}
