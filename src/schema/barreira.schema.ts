import { z } from 'zod'

export const criarBarreiraSchema = z.object({

    tipo: z.enum([
    'area_interditada',
    'passagem_bloqueada',
    'escada_inoperante',
    'elevador_inoperante',
    'rampa_inoperante',
    'obra',
    'evento_temporario',
    'risco_localizado',
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
        type: z.enum(['Point', 'LineString', 'Polygon']),
        coordinates: z.any(),
    }),
  
    severidade: z.enum(['informativa', 'atencao', 'critico']).default('atencao'),
    visibilidade: z.enum(['publica', 'somente_socorrista']).default('publica'),
  
    periodoInicio: z.date('Data de início inválida'),
    periodoFim: z.date('Data de fim inválida').optional(),
  
    status: z.enum(['agendada', 'ativa', 'inativa', 'encerrada']).default('agendada'),
  
    mensagem: z.string()
    .max(120, 'Mensagem muito longa')
    .refine(val => !val || !/(http|www|@)/.test(val), 'Não contém links ou emails')
    .optional(),
}).refine(data => {
    if (data.tipo === 'outro') {
        return data.tipoOutro
    }
    return true
}, {
    message: 'Detalhe do tipo é obrigatório',
    path: ['tipoOutro'],
}).refine(data => {
    if (data.periodoFim) {
        return new Date(data.periodoFim) > new Date(data.periodoInicio)
    }
    return true
}, {
    message: 'Data final deve ser posterior à inicial',
    path: ['periodoFim'],
})

export const atualizarBarreiraSchema = z.object({

    tipo: z.enum([
        'area_interditada',
        'passagem_bloqueada',
        'escada_inoperante',
        'elevador_inoperante',
        'rampa_inoperante',
        'obra',
        'evento_temporario',
        'risco_localizado',
        'outro'
    ]).optional(),

    tipoOutro: z.string()
    .min(3, 'Detalhe deve ter pelo menos 3 caracteres')
    .max(40, 'Detalhe muito longo')
    .optional(),

    nome: z.string()
    .min(3, 'Nome muito curto')
    .max(60, 'Nome muito longo')
    .regex(/^[a-zA-Z0-9\s.,\-/&]+$/, 'Caracteres não permitidos')
    .optional(),

    posicao: z.object({
        type: z.enum(['Point', 'LineString', 'Polygon']),
        coordinates: z.any(),
    }).optional(),

    severidade: z.enum(['informativa', 'atencao', 'critico']).optional(),

    visibilidade: z.enum(['publica', 'somente_socorrista']).optional(),

    periodoInicio: z.date().optional(),
    periodoFim: z.date().optional(),
    
    status: z.enum(['agendada', 'ativa', 'inativa', 'encerrada']).optional(),

    mensagem: z.string()
    .max(120, 'Mensagem muito longa')
    .refine(val => !val || !/(http|www|@)/.test(val), 'Não contém links ou emails')
    .optional(),
})

export const barreiraIdSchema = z.object({
    id: z.cuid('ID inválido'),
})

export type CriarBarreira = z.infer<typeof criarBarreiraSchema>
export type AtualizarBarreira = z.infer<typeof atualizarBarreiraSchema>