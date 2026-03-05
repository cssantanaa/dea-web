import { z } from 'zod'

export const criarSocorristaSchema = z.object({
    estabelecimentoId: z.cuid('ID de estabelecimento inválido'),
    
    nome: z.string()
    .min(3, 'Nome muito curto')
    .max(80, 'Nome muito longo')
    .regex(/^[a-zA-Z0-9\s.,\-/&]+$/, 'Caracteres não permitidos'),
    
    usuario: z.string()
    .min(4, 'Usuário deve ter pelo menos 4 caracteres')
    .max(20, 'Usuário muito longo')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Caracteres inválidos')
    .refine(val => !val.includes('@'), 'Não use formato de email'),
    
    telefoneSms: z.string()
    .regex(/^\d{10,13}$/, 'Telefone inválido')
    .optional(),

    observacoes: z.string()
    .max(300, 'Texto muito longo')
    .refine(val => !val || !/(http|www|@)/.test(val), 'Não contém links ou emails')
    .optional(),
})

export const atualizarSocorristaSchema = z.object({
    nome: z.string()
    .min(3, 'Nome muito curto')
    .max(80, 'Nome muito longo')
    .regex(/^[a-zA-Z0-9\s.,\-/&]+$/, 'Caracteres não permitidos')
    .optional(),

    telefoneSms: z.string()
    .regex(/^\d{10,13}$/, 'Telefone inválido')
    .optional(),

    status: z.enum(['ativo', 'inativo']).optional(),

    observacoes: z.string()
    .max(300, 'Texto muito longo')
    .refine(val => !val || !/(http|www|@)/.test(val), 'Não contém links ou emails')
    .optional(),
})

export const socorristaIdSchema = z.object({
    id: z.cuid('ID inválido'),
})

export type CriarSocorrista = z.infer<typeof criarSocorristaSchema>
export type AtualizarSocorrista = z.infer<typeof atualizarSocorristaSchema>