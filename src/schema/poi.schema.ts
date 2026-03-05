import { z } from 'zod'

export const criarPOISchema = z.object({
    
    tipo: z.enum([
        'dea', 
        'extintor', 
        'saida_emergencia', 
        'escada', 
        'elevador', 
        'rampa', 
        'ponto_encontro', 
        'posto_medico', 
        'hidrante', 
        'outro'
    ]),

    tipoOutro: z.string()
    .min(3, 'Detalhe deve ter pelo menos 3 caracteres')
    .max(40, 'Detalhe muito longo')
    .optional(),
  
    nome: z.string()
    .min(3, 'Nome muito curto')
    .max(60, 'Nome muito longo')
    .regex(/^[a-zA-Z0-9\s.,\-/&]+$/, 'Caracteres não permitidos'),
    
    andarId: z.cuid('ID de andar inválido'),
  
    posicao: z.object({
        type: z.enum(['Point', 'Polygon']),
        coordinates: z.any(),
    }),

  
    acessibilidade: z.enum(['acessivel', 'nao_acessivel', 'desconhecido'])
    .default('desconhecido'),
  
    status: z.enum(['ativo', 'inativo', 'em_manutencao'])
    .default('ativo'),
  
    visibilidade: z.enum(['publico', 'somente_socorrista'])
    .default('publico'),
  
    capacidadeDetalhe: z.string()
    .max(40, 'Detalhe muito longo')
    .optional(),

    orientacaoTexto: z.string()
    .max(120, 'Texto muito longo')
    .refine(val => !val || !/(http|www|@)/.test(val), 'Não contém links ou emails')
    .optional(),

    prioridadeRota: z.number()
    .int()
    .min(1, 'Prioridade mínima é 1')
    .max(5, 'Prioridade máxima é 5')
    .default(3),
}).refine(data => {
    if (data.tipo === 'outro') {
        return data.tipoOutro
    }
  return true
}, {
    message: 'Detalhe do tipo é obrigatório',
    path: ['tipoOutro'],
})

export const atualizarPOISchema = criarPOISchema.partial()
    .omit({ andarId: true })

export const poiIdSchema = z.object({
    id: z.cuid('ID inválido'),
})

export type CriarPOI = z.infer<typeof criarPOISchema>
export type AtualizarPOI = z.infer<typeof atualizarPOISchema>