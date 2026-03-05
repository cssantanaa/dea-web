import { prisma } from '@/lib/prisma'

type TipoEvento =
  | 'criacao'
  | 'edicao'
  | 'ativacao'
  | 'inativacao'
  | 'exclusao'
  | 'login'
  | 'logout'
  | 'reset_senha'
  | 'acesso_mapa'
  | 'acesso_negado'
  | 'consulta'
  | 'revogacao'
  | 'reativacao'
  | 'substituicao'

type RecursoAfetado =
  | 'cliente'
  | 'estabelecimento'
  | 'andar'
  | 'administrador'
  | 'socorrista'
  | 'poi'
  | 'codigo_acesso'
  | 'rede_wifi'
  | 'barreira'
  | 'metrica'
  | 'atendimento'

type Resultado = 'sucesso' | 'falha'

interface AuditoriaInput {
  usuarioResponsavel?: string
  perfil: 'super_admin' | 'admin_estabelecimento' | 'socorrista' | 'publico' | 'sistema';
  estabelecimentoId?: string
  tipoEvento: TipoEvento
  recursoAfetado: RecursoAfetado
  recursoId?: string
  resultado: Resultado
  origemRequisicao?: string
  detalhes?: Record<string, unknown>
  }

export const auditoriaService = {
  async registrar(input: AuditoriaInput) {
    try {
      await prisma.auditoria.create({
        data: {
        dataHora: new Date(),
        usuarioResponsavel: input.usuarioResponsavel,
        perfil: input.perfil,
        estabelecimentoId: input.estabelecimentoId,
        tipoEvento: input.tipoEvento,
        recursoAfetado: input.recursoAfetado,
        recursoId: input.recursoId,
        resultado: input.resultado,
        origemRequisicao: input.origemRequisicao,
        // detalhes: input.detalhes,
      },
    })
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error)
    }
  },

  async consultar(params: {
    periodoInicio: Date
    periodoFim: Date
    usuarioResponsavel?: string
    perfil?: string
    tipoEvento?: string[]
    recursoAfetado?: string
    resultado?: string
    estabelecimentoId?: string
    pagina?: number
    limite?: number
  }) {
  const {
    periodoInicio,
    periodoFim,
    usuarioResponsavel,
    perfil,
    tipoEvento,
    recursoAfetado,
    resultado,
    estabelecimentoId,
    pagina = 1,
    limite = 20,
    } = params

  if (periodoFim <= periodoInicio) {
    throw new Error('Data final deve ser posterior à inicial')
    }

  const where: Record<string, unknown> = {
    dataHora: {
      gte: periodoInicio,
      lte: periodoFim,
    },
  }

  if (usuarioResponsavel) where.usuarioResponsavel = usuarioResponsavel
  if (perfil) where.perfil = perfil
  if (recursoAfetado) where.recursoAfetado = recursoAfetado
  if (resultado) where.resultado = resultado
  if (estabelecimentoId) where.estabelecimentoId = estabelecimentoId
  if (tipoEvento && tipoEvento.length > 0) {
    where.tipoEvento = { in: tipoEvento }
  }

  const [registros, total] = await Promise.all([
    prisma.auditoria.findMany({
      where,
      include: {
        estabelecimento: {
          select: { id: true, nome: true },
        },
      },
      orderBy: { dataHora: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
      prisma.auditoria.count({ where }),
    ])

    return {
      data: registros,
      meta: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    }
  },

  async buscarPorId(id: string) {
    const registro = await prisma.auditoria.findUnique({
      where: { id },
      include: {
        estabelecimento: {
          select: { id: true, nome: true },
        },
      },
    })

    if (!registro) {
      throw new Error('Registro de auditoria não encontrado')
    }

    return registro
  },
}