import { z } from 'zod';
import { Estabelecimento } from '../../@types/schema'

// Isso implementa as regras do RF019
export const establishmentSchema = z.object({
  nome: z.string().min(3).max(100).regex(/^[a-zA-Z0-9.,/& -]+$/),
  cnpj: z.string().length(14).regex(/^\d+$/),
  tipoOperacao: z.enum(['permanente', 'evento']),
  clienteId: z.string().min(1, "Seleção de cliente é obrigatória"),

}).refine((data) => {
  if (data.tipoOperacao === 'evento' && (!data.dataInicio || !data.dataFim)) return false;
  return true;
}, { message: "Datas são obrigatórias para eventos" });