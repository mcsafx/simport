import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Buscar todas as invoices de um embarque
router.get('/embarque/:embarqueId', async (req, res) => {
  try {
    const { embarqueId } = req.params

    const invoices = await prisma.invoice.findMany({
      where: { embarqueId },
      include: {
        exportador: true,
        containers: true,
        produtos: {
          include: {
            unidadeMedida: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.json({
      success: true,
      data: invoices
    })
  } catch (error) {
    console.error('Erro ao buscar invoices:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Buscar uma invoice específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        exportador: true,
        containers: true,
        produtos: {
          include: {
            unidadeMedida: true
          }
        },
        embarque: {
          include: {
            exportador: true,
            armador: true,
            portoOrigem: true,
            portoDestino: true
          }
        }
      }
    })

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice não encontrada'
      })
    }

    return res.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('Erro ao buscar invoice:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Criar nova invoice com produtos e containers
router.post('/', async (req, res) => {
  try {
    const {
      numero,
      dataEmissao,
      valorTotal,
      moeda,
      peso,
      volumes,
      observacoes,
      embarqueId,
      exportadorId,
      produtos,
      containers
    } = req.body

    // Validações
    if (!numero || !dataEmissao || !embarqueId || !exportadorId) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: numero, dataEmissao, embarqueId, exportadorId'
      })
    }

    if (!produtos || produtos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A invoice deve ter pelo menos um produto'
      })
    }

    if (!containers || containers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A invoice deve ter pelo menos um container'
      })
    }

    // Verificar se o embarque existe
    const embarque = await prisma.embarque.findUnique({
      where: { id: embarqueId }
    })

    if (!embarque) {
      return res.status(404).json({
        success: false,
        message: 'Embarque não encontrado'
      })
    }

    // Criar invoice com produtos e containers em transação
    const result = await prisma.$transaction(async (prisma) => {
      // Criar a invoice
      const novaInvoice = await prisma.invoice.create({
        data: {
          numero,
          dataEmissao: new Date(dataEmissao),
          valorTotal,
          moeda,
          peso,
          volumes,
          observacoes,
          embarqueId,
          exportadorId
        }
      })

      // Criar os produtos
      const produtosCriados = await Promise.all(
        produtos.map((produto: any) =>
          prisma.produto.create({
            data: {
              descricao: produto.descricao,
              ncm: produto.ncm,
              quantidade: produto.quantidade,
              unidadeMedidaId: produto.unidadeMedidaId,
              valorUnitario: produto.valorUnitario,
              valorTotal: produto.valorTotal,
              peso: produto.peso,
              invoiceId: novaInvoice.id
            }
          })
        )
      )

      // Criar os containers e vincular à invoice
      const containersCriados = await Promise.all(
        containers.map((container: any) =>
          prisma.container.create({
            data: {
              numero: container.numero,
              tipo: container.tipo,
              tamanho: container.tamanho,
              peso: container.peso,
              embarqueId,
              invoiceId: novaInvoice.id
            }
          })
        )
      )

      return {
        invoice: novaInvoice,
        produtos: produtosCriados,
        containers: containersCriados
      }
    })

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Invoice criada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao criar invoice:', error)
    
    if ((error as any).code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Número da invoice já existe'
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Atualizar invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      numero,
      dataEmissao,
      valorTotal,
      moeda,
      peso,
      volumes,
      observacoes,
      exportadorId,
      produtos,
      containers
    } = req.body

    // Verificar se a invoice existe
    const invoiceExistente = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!invoiceExistente) {
      return res.status(404).json({
        success: false,
        message: 'Invoice não encontrada'
      })
    }

    // Atualizar em transação
    const result = await prisma.$transaction(async (prisma) => {
      // Atualizar a invoice
      const invoiceAtualizada = await prisma.invoice.update({
        where: { id },
        data: {
          numero,
          dataEmissao: dataEmissao ? new Date(dataEmissao) : undefined,
          valorTotal,
          moeda,
          peso,
          volumes,
          observacoes,
          exportadorId
        }
      })

      // Se produtos foram fornecidos, atualizar
      if (produtos) {
        // Remover produtos existentes
        await prisma.produto.deleteMany({
          where: { invoiceId: id }
        })

        // Criar novos produtos
        await Promise.all(
          produtos.map((produto: any) =>
            prisma.produto.create({
              data: {
                descricao: produto.descricao,
                ncm: produto.ncm,
                quantidade: produto.quantidade,
                unidadeMedidaId: produto.unidadeMedidaId,
                valorUnitario: produto.valorUnitario,
                valorTotal: produto.valorTotal,
                peso: produto.peso,
                invoiceId: id
              }
            })
          )
        )
      }

      // Se containers foram fornecidos, atualizar
      if (containers) {
        // Atualizar containers para remover vinculação com esta invoice
        await prisma.container.updateMany({
          where: { invoiceId: id },
          data: { invoiceId: null }
        })

        // Vincular novos containers
        await Promise.all(
          containers.map((container: any) => {
            if (container.id) {
              return prisma.container.update({
                where: { id: container.id },
                data: { invoiceId: id }
              })
            } else {
              return prisma.container.create({
                data: {
                  numero: container.numero,
                  tipo: container.tipo,
                  tamanho: container.tamanho,
                  peso: container.peso,
                  embarqueId: invoiceExistente.embarqueId,
                  invoiceId: id
                }
              })
            }
          })
        )
      }

      return invoiceAtualizada
    })

    return res.json({
      success: true,
      data: result,
      message: 'Invoice atualizada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar invoice:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Deletar invoice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Verificar se a invoice existe
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice não encontrada'
      })
    }

    // Deletar em transação (produtos e containers são deletados por cascade)
    await prisma.$transaction(async (prisma) => {
      // Remover vinculação dos containers (mas não deletar os containers)
      await prisma.container.updateMany({
        where: { invoiceId: id },
        data: { invoiceId: null }
      })

      // Deletar a invoice (produtos são deletados por cascade)
      await prisma.invoice.delete({
        where: { id }
      })
    })

    return res.json({
      success: true,
      message: 'Invoice deletada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar invoice:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

export default router