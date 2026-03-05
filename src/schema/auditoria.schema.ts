import { z } from 'zod'

export const consultarAuditoriaSchema = z.object({
    periodoInicio: z.date('Data de início inválida'),
    periodoFim: z.date('Data de fim inválida'),
    usuarioResponsavel: z.string().optional(),
    perfil: z.enum(['super_admin', 'admin_estabelecimento', 'socorrista', 'publico']).optional(),
    tipoEvento: z.array(z.string()).optional(),
    recursoAfetado: z.string().optional(),
    resultado: z.enum(['sucesso', 'falha']).optional(),
    estabelecimentoId: z.cuid().optional(),
    pagina: z.number().int().min(1).default(1),
    limite: z.number().int().min(1).max(100).default(20),
}).refine(data => {
    return new Date(data.periodoFim) > new Date(data.periodoInicio)
}, {
    message: 'Data final deve ser posterior à inicial',
    path: ['periodoFim'],
})

export type ConsultarAuditoria = z.infer<typeof consultarAuditoriaSchema>