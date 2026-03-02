import { prisma } from '@/lib/prisma'
import { criarCliente, atualizarCliente } from '../schema/cliente.schema'
import { auditoriaService } from './auditoria.service'

export const clienteService = {
    async criar(data: criarCliente, usuarioId: string) {
        const cnpjExistente = await prisma.cliente.findUnique({
        where: { cnpj: data.cnpj },
    });

    if (cnpjExistente) {
        throw new Error('CNPJ já cadastrado')
    }

    const cliente = await prisma.cliente.create({
        data: {
            nome: data.nome,
            cnpj: data.cnpj,
            email: data.email || null,
            telefone: data.telefone || null,
            status: 'ativo',
        },
    })

    await auditoriaService.registrar({
        usuarioResponsavel: usuarioId,
        perfil: 'super_admin',
        tipoEvento: 'criacao',
        recursoAfetado: 'cliente',
        recursoId: cliente.id,
        resultado: 'sucesso',
    })

    return cliente
  },

    async listar(params: {
        status?: string
        busca?: string
        pagina?: number
        limite?: number
  }) {
    const { status, busca, pagina = 1, limite = 10 } = params

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { cnpj: { contains: busca } },
      ]
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        include: {
          _count: {
            select: { estabelecimentos: true, usuarios: true },
          },
        },
        orderBy: { nome: 'asc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.cliente.count({ where }),
    ])

    return { data: clientes, meta: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) } }
  },

  async buscarPorId(id: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        estabelecimentos: { orderBy: { nome: 'asc' } },
        _count: { select: { usuarios: true, estabelecimentos: true } },
      },
    })

    if (!cliente) throw new Error('Cliente não encontrado')
    return cliente
  },

  async atualizar(id: string, data: atualizarClienteSchema, usuarioId: string) {
    const cliente = await prisma.cliente.findUnique({ where: { id } })
    if (!cliente) throw new Error('Cliente não encontrado')

    if (data.cnpj && data.cnpj !== cliente.cnpj) {
      const cnpjExistente = await prisma.cliente.findUnique({ where: { cnpj: data.cnpj } })
      if (cnpjExistente) throw new Error('CNPJ já cadastrado')
    }

    const atualizado = await prisma.cliente.update({
      where: { id },
      data: { ...data, email: data.email || null, telefone: data.telefone || null },
    })

    await auditoriaService.registrar({
      usuarioResponsavel: usuarioId,
      perfil: 'super_admin',
      tipoEvento: 'edicao',
      recursoAfetado: 'cliente',
      recursoId: id,
      resultado: 'sucesso',
    })

    return atualizado
  },

    async alternarStatus(id: string, usuarioId: string) {
        const cliente = await prisma.cliente.findUnique({ where: { id } })
        if (!cliente) throw new Error('Cliente não encontrado')

        const novoStatus = cliente.status === 'ativo' ? 'inativo' : 'ativo'
        const atualizado = await prisma.cliente.update({ where: { id }, data: { status: novoStatus } })

        await auditoriaService.registrar({
        usuarioResponsavel: usuarioId,
        perfil: 'super_admin',
        tipoEvento: novoStatus === 'ativo' ? 'ativacao' : 'inativacao',
        recursoAfetado: 'cliente',
        recursoId: id,
        resultado: 'sucesso',
    })

    return atualizado
  },

    async excluir(id: string, usuarioId: string) {
        const cliente = await prisma.cliente.findUnique({ where: { id } })
        if (!cliente) throw new Error('Cliente não encontrado')

        const dependencias = await prisma.estabelecimento.count({ where: { clienteId: id } })
        if (dependencias > 0) {
          throw new Error('Cliente possui estabelecimentos vinculados')
        }

        await prisma.cliente.delete({ where: { id } })

        await auditoriaService.registrar({
            usuarioResponsavel: usuarioId,
            perfil: 'super_admin',
            tipoEvento: 'exclusao',
            recursoAfetado: 'cliente',
            recursoId: id,
            resultado: 'sucesso',
        })

    return { mensagem: 'Cliente excluído com sucesso' }
  },
}