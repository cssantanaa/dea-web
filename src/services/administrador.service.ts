import { prisma } from '@/lib/prisma'
import { CriarAdministrador, AtualizarAdministrador } from '../schema/administrador.schema'
import { auditoriaService } from './auditoria.service'
import bcrypt from 'bcryptjs'

export const administradorService = {
    async criar(data: CriarAdministrador, usuarioId: string) {
        const estabelecimento = await prisma.estabelecimento.findUnique({
        where: { id: data.estabelecimentoId },
        include: { cliente: true },
    })

    if (!estabelecimento) {
      throw new Error('Estabelecimento não encontrado')
    }

    if (estabelecimento.statusEstabelecimento === 'encerrado') {
      throw new Error('Estabelecimento encerrado não pode ter administradores')
    }

    const usuarioExistente = await prisma.usuarioAdmin.findFirst({
      where: { clienteId: estabelecimento.clienteId, usuario: data.usuario },
    })

    if (usuarioExistente) {
      throw new Error('Usuário já em uso neste cliente')
    }

    if (data.telefoneSms) {
        const telefoneExistente = await prisma.usuarioAdmin.findFirst({
        where: { estabelecimentoId: data.estabelecimentoId, telefoneSms: data.telefoneSms },
      })
      if (telefoneExistente) {
        throw new Error('Telefone já cadastrado para outro administrador')
      }
    }

    const senhaHash = await bcrypt.hash(data.senhaInicial, 12)

    const administrador = await prisma.usuarioAdmin.create({
      data: {
        nome: data.nome,
        usuario: data.usuario,
        telefoneSms: data.telefoneSms,
        senha: senhaHash,
        estabelecimentoId: data.estabelecimentoId,
        clienteId: estabelecimento.clienteId,
        permissoes: data.permissoes,
        obrigarTrocaPrimeiroAcesso: data.obrigarTrocaPrimeiroAcesso,
        observacoes: data.observacoes,
        status: 'ativo',
      },
    })

    await auditoriaService.registrar({
      usuarioResponsavel: usuarioId,
      perfil: 'super_admin',
      estabelecimentoId: data.estabelecimentoId,
      tipoEvento: 'criacao',
      recursoAfetado: 'administrador',
      recursoId: administrador.id,
      resultado: 'sucesso',
    })

    return {
      id: administrador.id,
      nome: administrador.nome,
      usuario: administrador.usuario,
      senhaTemporaria: data.senhaInicial,
    }
  },

    async listar(params: {
        estabelecimentoId?: string
        clienteId?: string
        status?: string
        pagina?: number
        limite?: number
  }) {
    const { estabelecimentoId, clienteId, status, pagina = 1, limite = 10 } = params

    const where: Record<string, unknown> = {}
    if (estabelecimentoId) where.estabelecimentoId = estabelecimentoId
    if (clienteId) where.clienteId = clienteId
    if (status) where.status = status

    const [administradores, total] = await Promise.all([
      prisma.usuarioAdmin.findMany({
        where,
        select: {
          id: true, nome: true, usuario: true, telefoneSms: true, status: true,
          obrigarTrocaPrimeiroAcesso: true, permissoes: true, createdAt: true, ultimoLogin: true,
          estabelecimento: { select: { id: true, nome: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.usuarioAdmin.count({ where }),
    ])

    return { data: administradores, meta: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) } }
    },

    async buscarPorId(id: string) {
        const administrador = await prisma.usuarioAdmin.findUnique({
        where: { id },
        select: {
            id: true, nome: true, usuario: true, telefoneSms: true, status: true,
            obrigarTrocaPrimeiroAcesso: true, permissoes: true, observacoes: true,
            createdAt: true, updatedAt: true, ultimoLogin: true,
            estabelecimento: { select: { id: true, nome: true } },
        },
    })

        if (!administrador) throw new Error('Administrador não encontrado')
        return administrador
    },

    async atualizar(id: string, data: AtualizarAdministrador, usuarioId: string) {
        const administrador = await prisma.usuarioAdmin.findUnique({ where: { id } })
        if (!administrador) throw new Error('Administrador não encontrado')

    if (data.telefoneSms && data.telefoneSms !== administrador.telefoneSms) {
      const telefoneExistente = await prisma.usuarioAdmin.findFirst({
        where: { estabelecimentoId: administrador.estabelecimentoId, telefoneSms: data.telefoneSms, NOT: { id } },
      })
      if (telefoneExistente) throw new Error('Telefone já cadastrado para outro administrador')
    }

    const atualizado = await prisma.usuarioAdmin.update({
      where: { id },
      data: {
        nome: data.nome,
        telefoneSms: data.telefoneSms,
        permissoes: data.permissoes,
        obrigarTrocaPrimeiroAcesso: data.obrigarTrocaPrimeiroAcesso,
        status: data.status,
        observacoes: data.observacoes,
      },
    })

    await auditoriaService.registrar({
      usuarioResponsavel: usuarioId,
      perfil: 'super_admin',
      estabelecimentoId: administrador.estabelecimentoId,
      tipoEvento: 'edicao',
      recursoAfetado: 'administrador',
      recursoId: id,
      resultado: 'sucesso',
    })

    return atualizado
  },

  async alternarStatus(id: string, usuarioId: string) {
    const administrador = await prisma.usuarioAdmin.findUnique({ where: { id } })
    if (!administrador) throw new Error('Administrador não encontrado')

    const novoStatus = administrador.status === 'ativo' ? 'inativo' : 'ativo'
    const atualizado = await prisma.usuarioAdmin.update({
      where: { id },
      data: { status: novoStatus },
    })

    await auditoriaService.registrar({
      usuarioResponsavel: usuarioId,
      perfil: 'super_admin',
      estabelecimentoId: administrador.estabelecimentoId,
      tipoEvento: novoStatus === 'ativo' ? 'ativacao' : 'inativacao',
      recursoAfetado: 'administrador',
      recursoId: id,
      resultado: 'sucesso',
    })

    return atualizado
  },

  async resetarSenha(id: string, novaSenha: string, usuarioId: string) {
    const administrador = await prisma.usuarioAdmin.findUnique({ where: { id } })
    if (!administrador) throw new Error('Administrador não encontrado')

    const senhaHash = await bcrypt.hash(novaSenha, 12)

    await prisma.usuarioAdmin.update({
      where: { id },
      data: { senha: senhaHash, obrigarTrocaPrimeiroAcesso: true },
    })

    await auditoriaService.registrar({
      usuarioResponsavel: usuarioId,
      perfil: 'super_admin',
      estabelecimentoId: administrador.estabelecimentoId,
      tipoEvento: 'reset_senha',
      recursoAfetado: 'administrador',
      recursoId: id,
      resultado: 'sucesso',
    })

    return { mensagem: 'Senha resetada com sucesso' }
  },

  async excluir(id: string, usuarioId: string) {
    const administrador = await prisma.usuarioAdmin.findUnique({ where: { id } })
    if (!administrador) throw new Error('Administrador não encontrado')

    await prisma.usuarioAdmin.delete({ where: { id } })

    await auditoriaService.registrar({
      usuarioResponsavel: usuarioId,
      perfil: 'super_admin',
      estabelecimentoId: administrador.estabelecimentoId,
      tipoEvento: 'exclusao',
      recursoAfetado: 'administrador',
      recursoId: id,
      resultado: 'sucesso',
    })

    return { mensagem: 'Administrador excluído com sucesso' }
  },
}