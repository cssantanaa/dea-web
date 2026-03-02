import { z } from 'zod'

export const criarCliente = z.object({
    nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
    cnpj: z.string()
    .length(14, 'CNPJ deve conter 14 dígitos')
    .regex(/^\d+$/, 'CNPJ deve conter apenas números'),
    email: z.email('Email inválido').optional().or(z.literal('')),
    telefone: z.string().optional(),
})

export const atualizarCliente = criarCliente.partial()

export const clienteIdSchema = z.object({
    id: z.cuid('ID inválido'),
})


export type CriarCliente = z.infer<typeof criarCliente>;
export type AtualizarCliente = z.infer<typeof atualizarCliente>;