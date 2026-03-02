import { z } from 'zod'

export const criarAdministradorSchema = z.object({
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
  
    senhaInicial: z.string()
    .min(8, 'Senha muito curta')
    .max(64, 'Senha muito longa'),

    obrigarTrocaPrimeiroAcesso: z.boolean().default(true),

     permissoes: z.array(z.enum([
    'importar_mapas_e_configurar_geofence',
    'gerenciar_pois',
    'gerenciar_socorrista',
    'configurar_codigos_internos',
    'gerar_codigos_qr',
    'configurar_redes_wifi',
    'consultar_metricas',
    'gerenciar_barreiras',
    'consultar_historico',
    ])).min(1, 'Selecione ao menos uma permissão'),

    observacoes: z.string()
    .max(300, 'Texto muito longo')
    .refine(val => !val || !/(http|www|@|\d{5,})/.test(val), 'Remova links, emails ou telefones')
    .optional(),
})

export const atualizarAdministradorSchema = z.object({

    nome: z.string()
    .min(3, 'Nome muito curto')
    .max(80, 'Nome muito longo')
    .regex(/^[a-zA-Z0-9\s.,\-/&]+$/, 'Caracteres não permitidos')
    .optional(),

    telefoneSms: z.string()
    .regex(/^\d{10,13}$/, 'Telefone inválido')
    .optional(),
    
    permissoes: z.array(z.enum([
    'importar_mapas_e_configurar_geofence',
    'gerenciar_pois',
    'gerenciar_socorrista',
    'configurar_codigos_internos',
    'gerar_codigos_qr',
    'configurar_redes_wifi',
    'consultar_metricas',
    'gerenciar_barreiras',
    'consultar_historico',
    ])).min(1, 'Selecione ao menos uma permissão')
    .optional(),

    obrigarTrocaPrimeiroAcesso: z.boolean().optional(),

    status: z.enum(['ativo', 'inativo']).optional(),

    observacoes: z.string()
    .max(300, 'Texto muito longo')
    .refine(val => !val || !/(http|www|@|\d{5,})/.test(val), 'Remova links, emails ou telefones')
    .optional(),
})

export const administradorIdSchema = z.object({
    id: z.cuid('ID inválido'),
})

export type CriarAdministradorInput = z.infer<typeof criarAdministradorSchema>
export type AtualizarAdministradorInput = z.infer<typeof atualizarAdministradorSchema>