import { prisma } from '@/lib/prisma'
import { criarEstabelecimentoSchema, atualizarEstabelecimentoSchema } from '../schema/estabelecimento.schema'
import { auditoriaService } from '../services/auditoria.service'

export const estabelecimentoService = {
    async criar(data: criarEstabelecimentoSchema, usuarioId: string) {

    const cliente = await prisma.cliente.findUnique({
      where: { id: data.clienteId },
    })
    
    if (!cliente || cliente.status !== 'ativo') {
      throw new Error('Cliente não encontrado ou inativo')
    }
    

    const cnpjExistente = await prisma.estabelecimento.findUnique({
      where: { documentoIdentificacao: data.documentoIdentificacao },
    })
    
    if (cnpjExistente) {
      throw new Error('CNPJ já cadastrado')
    }
    
    if (data.tipoOperacao === 'evento') {
      const inicio = new Date(data.dataInicioEvento!)
      const fim = new Date(data.dataFimEvento!)
      
      if (fim <= inicio) {
        throw new Error('Data final deve ser posterior à inicial')
      }
    }
    
    const estabelecimento = await prisma.estabelecimento.create({
        data: {
            nome: data.nome,
            clienteId: data.clienteId,
            tipoOperacao: data.tipoOperacao,
            dataInicioEvento: data.dataInicioEvento ? new Date(data.dataInicioEvento) : null,
            dataFimEvento: data.dataFimEvento ? new Date(data.dataFimEvento) : null,
            documentoIdentificacao: data.documentoIdentificacao,
            categoria: data.categoria,
            categoriaOutro: data.categoriaOutro,
            logradouro: data.logradouro,
            numero: data.numero,
            bairro: data.bairro,
            cidade: data.cidade,
            uf: data.uf,
            cep: data.cep,
            complemento: data.complemento,
            capacidadeEstimada: data.capacidadeEstimada,
            observacoesInternas: data.observacoesInternas,
            statusEstabelecimento: 'rascunho',
            statusConfiguracaoMapa: 'pendente',
        },
    })
    
    await auditoriaService.registrar({
      usuarioResponsavel: usuarioId,
      perfil: 'super_admin',
      estabelecimentoId: estabelecimento.id,
      tipoEvento: 'criacao',
      recursoAfetado: 'estabelecimento',
      recursoId: estabelecimento.id,
      resultado: 'sucesso',
    })
    
    return estabelecimento
  },

    async listar(params: {
    clienteId?: string
    status?: string
    busca?: string
    pagina?: number
    limite?: number
  }) {
    const { clienteId, status, busca, pagina = 1, limite = 10 } = params
    
    const where: Record<string, unknown> = {}
    if (clienteId) where.clienteId = clienteId
    if (status) where.statusEstabelecimento = status
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { documentoIdentificacao: { contains: busca } },
      ]
    }
    
    const [estabelecimentos, total] = await Promise.all([
      prisma.estabelecimento.findMany({
        where,
        include: {
          cliente: { select: { id: true, nome: true } },
          _count: { select: { administradores: true, pois: true, socorristas: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.estabelecimento.count({ where }),
    ])
    
    return { data: estabelecimentoes, meta: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) } }
  },

    async buscarPorId(id: string) {
        const estabelecimento = await prisma.estabelecimento.findUnique({
        where: { id },
        include: {
            cliente: { select: { id: true, nome: true, cnpj: true } },
            andares: { orderBy: { numero: 'asc' } },
        _   count: { select: { administradores: true, pois: true, socorristas: true, codigosAcesso: true, redesWifi: true } },
        },
    })
    
    if (!estabelecimento) throw new Error('Estabelecimento não encontrado')
    return estabelecimento
  },

    async atualizar(id: string, data: atualizarEstabelecimentoSchema, usuarioId: string) {
        const estabelecimento = await prisma.estabelecimento.findUnique({ where: { id } })
        if (!estabelecimento) throw new Error('Estabelecimento não encontrado')
    
        if (data.documentoIdentificacao && data.documentoIdentificacao !== estabelecimento.documentoIdentificacao) {
        const cnpjExistente = await prisma.estabelecimento.findUnique({
            where: { documentoIdentificacao: data.documentoIdentificacao },
      })
        if (cnpjExistente) throw new Error('CNPJ já cadastrado')
    }
    
    const tipoOperacao = data.tipoOperacao ?? estabelecimento.tipoOperacao
        if (tipoOperacao === 'evento') {
        const inicio = data.dataInicioEvento ? new Date(data.dataInicioEvento) : estabelecimento.dataInicioEvento
        const fim = data.dataFimEvento ? new Date(data.dataFimEvento) : estabelecimento.dataFimEvento
        if (!inicio || !fim || fim <= inicio) {
            throw new Error('Data final deve ser posterior à inicial')
        }
    }
    
    const atualizado = await prisma.estabelecimento.update({
        where: { id },
        data: {
            nome: data.nome,
            tipoOperacao: data.tipoOperacao,
            dataInicioEvento: data.dataInicioEvento ? new Date(data.dataInicioEvento) : undefined,
            dataFimEvento: data.dataFimEvento ? new Date(data.dataFimEvento) : undefined,
            documentoIdentificacao: data.documentoIdentificacao,
            categoria: data.categoria,
            categoriaOutro: data.categoriaOutro,
            logradouro: data.logradouro,
            numero: data.numero,
            bairro: data.bairro,
            cidade: data.cidade,
            uf: data.uf,
            cep: data.cep,
            complemento: data.complemento,
            capacidadeEstimada: data.capacidadeEstimada,
            observacoesInternas: data.observacoesInternas,
      },
    })
    
    await auditoriaService.registrar({
      usuarioResponsavel: usuarioId,
      perfil: 'super_admin',
      estabelecimentoId: id,
      tipoEvento: 'edicao',
      recursoAfetado: 'estabelecimento',
      recursoId: id,
      resultado: 'sucesso',
    })
    
    return atualizado
  },

    async alternarStatus(id: string, usuarioId: string) {
        const estabelecimento = await prisma.estabelecimento.findUnique({ where: { id } })
        if (!estabelecimento) throw new Error('Estabelecimento não encontrado')
    
        if (estabelecimento.tipoOperacao === 'evento' && estabelecimento.dataFimEvento) {
        if (new Date() > estabelecimento.dataFimEvento) {
            const atualizado = await prisma.estabelecimento.update({
                where: { id },
                data: { statusEstabelecimento: 'encerrado' },
            })
        return atualizado
      }
    }
    
    const novoStatus = estabelecimento.statusEstabelecimento === 'ativo' ? 'inativo' : 'ativo'
    const atualizado = await prisma.estabelecimento.update({
      where: { id },
      data: { statusEstabelecimento: novoStatus },
    })
    
    await auditoriaService.registrar({
      usuarioResponsavel: usuarioId,
      perfil: 'super_admin',
      estabelecimentoId: id,
      tipoEvento: novoStatus === 'ativo' ? 'ativacao' : 'inativacao',
      recursoAfetado: 'estabelecimento',
      recursoId: id,
      resultado: 'sucesso',
    })
    
    return atualizado
  },

    async verificarEventosEncerrados() {
        const eventos = await prisma.estabelecimento.findMany({
        where: {
            tipoOperacao: 'evento',
            statusEstabelecimento: { in: ['rascunho', 'ativo', 'inativo'] },
            dataFimEvento: { lt: new Date() },
        },
    })
    
    for (const evento of eventos) {
      await prisma.estabelecimento.update({
        where: { id: evento.id },
        data: { statusEstabelecimento: 'encerrado' },
      })
      
      await auditoriaService.registrar({
        perfil: 'sistema',
        estabelecimentoId: evento.id,
        tipoEvento: 'inativacao',
        recursoAfetado: 'estabelecimento',
        recursoId: evento.id,
        resultado: 'sucesso',
        detalhes: { motivo: 'evento_encerrado_automaticamente' },
      })
    }
    
    return { atualizados: eventos.length }
  },
}