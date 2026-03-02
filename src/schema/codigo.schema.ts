import { z } from 'zod'

export const criarCodigoSchema = z.object({
    estabelecimentoId: z.cuid('ID de estabelecimento inválido'),
  

    modoGeracao: z.enum(['automatico', 'manual']),
  
    codigo: z.string()
    .length(6, 'Código deve ter 6 caracteres')
    .regex(/^[a-zA-Z0-9]+$/, 'Apenas letras e números')
    .optional(),
  
    descricao: z.string()
    .max(60, 'Descrição muito longa')
    .refine(val => !val || !/(http|www|@|\d{5,})/.test(val), 'Não contém links, emails ou telefones')
    .optional(),
  

    validadeInicio: z.date('Data de início inválida'),
    validadeFim: z.date('Data de fim inválida').optional(),
  
    gerarQr: z.boolean().default(true),
  
    status: z.enum(['ativo', 'revogado', 'expirado']).default('ativo'),

}).refine(data => {
  if (data.modoGeracao === 'manual' && !data.codigo) {
    return false
  }
  return true
}, {
    message: 'Código é obrigatório no modo manual',
    path: ['codigo'],
})

export const atualizarCodigoSchema = z.object({
  descricao: z.string()
    .max(60, 'Descrição muito longa')
    .refine(val => !val || !/(http|www|@|\d{5,})/.test(val), 'Não contém links, emails ou telefones')
    .optional(),

    validadeInicio: z.date().optional(),
    validadeFim: z.date().optional(),

    status: z.enum(['ativo', 'revogado', 'expirado']).optional(),
})

export const codigoIdSchema = z.object({
    id: z.cuid('ID inválido'),
})

export type CriarCodigoInput = z.infer<typeof criarCodigoSchema>
export type AtualizarCodigoInput = z.infer<typeof atualizarCodigoSchema>