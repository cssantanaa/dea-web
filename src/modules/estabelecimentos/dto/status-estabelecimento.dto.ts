import { IsEnum } from 'class-validator';
import { StatusEstabelecimento } from '@prisma/client';

export class EstabelecimentoStatusDto {
  @IsEnum(StatusEstabelecimento, { message: 'Status inválido.' })
  status!: StatusEstabelecimento;
}