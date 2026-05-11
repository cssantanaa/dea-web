import { Module } from '@nestjs/common';
import { WifiService } from './wifi.service';
import { WifiController } from './wifi.controller';
// import { AuditModule } from '../audit/audit.module';

@Module({
  // imports: [// AuditModule],
  providers: [WifiService],
  controllers: [WifiController],
  exports: [WifiService],
})
export class WifiModule {}
