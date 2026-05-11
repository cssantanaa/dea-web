import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BarreiraService } from './barreiras.service';
import { CodigosService } from '../codigos/codigos.service';
import { EstabelecimentoService } from '../estabelecimentos/estabelecimentos.service';


@Injectable()
export class AgendadorBarreiras {
  private readonly logger = new Logger(AgendadorBarreiras.name);

  constructor(
    private barreiras: BarreiraService,
    private codigos: CodigosService,
    private estabelecimentos: EstabelecimentoService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async runLifecycleTasks() {
    try {
      const [barreirasAtivadas, barreirasFechadas, codigosExpirados, eventosFechados] =
        await Promise.all([
          this.barreiras.ativarBarreirasAgendadas(),
          this.barreiras.fecharBarreirasExpiradas(),
          this.codigos.expirarCodigosAntigos(),
          this.estabelecimentos.encerrarEstabelecimentosExpirados(),
        ]);

      if (
        barreirasAtivadas.count > 0 ||
        barreirasFechadas.count > 0 ||
        codigosExpirados.count > 0 ||
        eventosFechados.count > 0
      ) {
        this.logger.log(
          `Lifecycle: +${barreirasAtivadas.count} barreiras ativadas, ` +
          `${barreirasFechadas.count} encerradas, ` +
          `${codigosExpirados.count} códigos expirados, ` +
          `${eventosFechados.count} eventos encerrados`,
        );
      }
    } catch (err) {
      this.logger.error('Erro no lifecycle CRON:', err);
    }
  }
}
