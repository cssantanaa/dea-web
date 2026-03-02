import { z } from 'zod'

export const criarWifiSchema = z.object({
    estabelecimentoId: z.cuid('ID de estabelecimento inválido'),
  
    nomeExibicao: z.string()
    .min(3, 'Nome muito curto')
    .max(60, 'Nome muito longo')
    .regex(/^[a-zA-Z0-9\s.,\-/&]+$/, 'Caracteres não permitidos'),
  
    ssid: z.string()
    .min(1, 'SSID obrigatório')
    .max(32, 'SSID muito longo')
    .regex(/^[a-zA-Z0-9\s!@#$%^&*()_+\-=.]+$/, 'Caracteres não permitidos no SSID')
    .refine(val => val.trim().length > 0, 'SSID não pode ser apenas espaços'),
  
    possuiPortalCaptivo: z.boolean().default(false),
  
    instrucoes: z.string()
    .max(120, 'Instruções muito longas')
    .refine(val => !val || !/(http|www|@)/.test(val), 'Não contém links ou emails')
    .optional(),
  
    validadeInicio: z.date('Data de início inválida'),
    validadeFim: z.date('Data de fim inválida').optional(),
  
    status: z.enum(['ativa', 'inativa']).default('ativa'),
})

export const atualizarWifiSchema = z.object({
    nomeExibicao: z.string()
    .min(3, 'Nome muito curto')
    .max(60, 'Nome muito longo')
    .regex(/^[a-zA-Z0-9\s.,\-/&]+$/, 'Caracteres não permitidos')
    .optional(),

    possuiPortalCaptivo: z.boolean().optional(),

    instrucoes: z.string()
    .max(120, 'Instruções muito longas')
    .refine(val => !val || !/(http|www|@)/.test(val), 'Não contém links ou emails')
    .optional(),
    
    validadeInicio: z.date().optional(),
    validadeFim: z.date().optional(),

    status: z.enum(['ativa', 'inativa']).optional(),
})

export const wifiIdSchema = z.object({
    id: z.cuid('ID inválido'),
})

export type CriarWifiInput = z.infer<typeof criarWifiSchema>
export type AtualizarWifiInput = z.infer<typeof atualizarWifiSchema>