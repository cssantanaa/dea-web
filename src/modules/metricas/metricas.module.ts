import { Module } from '@nestjs/common';
import { MetricasService } from './metricas.service';
import { MetricasController } from './metricas.controller';

@Module({
  providers: [MetricasService],
  controllers: [MetricasController],
})
export class MetricasModule {}
