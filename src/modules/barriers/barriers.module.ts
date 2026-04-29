import { Module } from '@nestjs/common';
import { BarriersService } from './barriers.service';
import { BarriersController } from './barriers.controller';
import { BarriersScheduler } from './barriers.scheduler';
import { AuditModule } from '../audit/audit.module';
import { CodesModule } from '../codes/codes.module';
import { EstablishmentsModule } from '../establishments/establishments.module';

@Module({
  imports: [AuditModule, CodesModule, EstablishmentsModule],
  providers: [BarriersService, BarriersScheduler],
  controllers: [BarriersController],
  exports: [BarriersService],
})
export class BarriersModule {}
