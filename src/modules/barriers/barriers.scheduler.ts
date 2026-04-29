// import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { BarriersService } from './barriers.service';
// import { CodesService } from '../codes/codes.service';
// import { EstablishmentsService } from '../establishments/establishments.service';

// @Injectable()
// export class BarriersScheduler {
//   private readonly logger = new Logger(BarriersScheduler.name);

//   constructor(
//     private barriers: BarriersService,
//     private codes: CodesService,
//     private establishments: EstablishmentsService,
//   ) {}

//   @Cron(CronExpression.EVERY_MINUTE)
//   async runLifecycleTasks() {
//     try {
//       const [activatedBarriers, closedBarriers, expiredCodes, closedEvents] =
//         await Promise.all([
//           this.barriers.activateScheduled(),
//           this.barriers.closeExpired(),
//           this.codes.expireOldCodes(),
//           this.establishments.closeExpiredEvents(),
//         ]);

//       if (
//         activatedBarriers.count > 0 ||
//         closedBarriers.count > 0 ||
//         expiredCodes.count > 0 ||
//         closedEvents.count > 0
//       ) {
//         this.logger.log(
//           `Lifecycle: +${activatedBarriers.count} barreiras ativadas, ` +
//           `${closedBarriers.count} encerradas, ` +
//           `${expiredCodes.count} códigos expirados, ` +
//           `${closedEvents.count} eventos encerrados`,
//         );
//       }
//     } catch (err) {
//       this.logger.error('Erro no lifecycle CRON:', err);
//     }
//   }
// }
