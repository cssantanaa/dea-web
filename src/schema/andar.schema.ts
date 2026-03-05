import { z } from 'zod'

export const criarAndarSchema = z.object({
    estabelecimentoId: z.cuid('ID de estabelecimento inválido'),
    nome: z.string()
    .min(1, 'Nome obrigatório')
    .max(50, 'Nome muito longo'),

    numero: z.number()
    .int('Número do andar deve ser inteiro'),
})

export const atualizarAndarSchema = criarAndarSchema.partial()

export const andarIdSchema = z.object({
    id: z.cuid('ID inválido'),
})

export type CriarAndar = z.infer<typeof criarAndarSchema>
export type AtualizarAndar = z.infer<typeof atualizarAndarSchema>