import { z } from 'zod'

export const criarEstabelecimentoSchema = z.object({
    nome: z.string()
    .min(3, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-Z0-9\s.,\-/&]+$/, 'Caracteres não permitidos'),

    clienteId: z.cuid('ID de cliente inválido'),
  
    tipoOperacao: z.enum(['permanente', 'evento']),

    dataInicioEvento: z.date().optional(),
    dataFimEvento: z.date().optional(),
  
    documentoIdentificacao: z.string()
    .length(14, 'CNPJ deve ter 14 dígitos')
    .regex(/^\d+$/, 'CNPJ deve conter apenas números'),
  
    categoria: z.enum([
        'shopping', 
        'faculdade', 
        'hospital', 
        'estadio', 
        'centro_convencoes', 
        'escritorio', 
        'industria', 
        'outros'
    ]),

    categoriaOutro: z.string()
    .min(3, 'Detalhe deve ter pelo menos 3 caracteres')
    .max(60, 'Detalhe muito longo')
    .optional(),
  
    logradouro: z.string().min(1, 'Logradouro obrigatório'),
    numero: z.string().min(1, 'Número obrigatório'),
    bairro: z.string().min(1, 'Bairro obrigatório'),
    cidade: z.string().min(1, 'Cidade obrigatória'),
    uf: z.string().length(2, 'UF deve ter 2 letras'),
    cep: z.string().length(8, 'CEP deve ter 8 dígitos').regex(/^\d+$/, 'CEP inválido'),
    complemento: z.string().optional(),
  
    capacidadeEstimada: z.number()
    .int()
    .min(1, 'Capacidade mínima é 1')
    .max(999999999, 'Capacidade muito alta'),
  
    observacoesInternas: z.string()
    .max(500, 'Observações muito longas')
    .refine(val => !val || !/(http|www|@|\d{5,})/.test(val), 'Observações não podem conter links, emails ou telefones')
    .optional(),
}).refine(data => {
    if (data.tipoOperacao === 'evento') {
        return data.dataInicioEvento && data.dataFimEvento
    }
    return true
}, {
    message: 'Datas de início e fim são obrigatórias para eventos',
    path: ['dataInicioEvento'],
}).refine(data => {
    if (data.categoria === 'outros') {
        return data.categoriaOutro
    }
    return true
}, {
    message: 'Detalhe da categoria é obrigatório',
    path: ['categoriaOutro'],
})

export const atualizarEstabelecimentoSchema = criarEstabelecimentoSchema.partial()
.omit({ clienteId: true })

export type CriarEstabelecimentoInput = z.infer<typeof criarEstabelecimentoSchema>
export type AtualizarEstabelecimentoInput = z.infer<typeof atualizarEstabelecimentoSchema>