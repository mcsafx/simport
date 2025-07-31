import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Criar entreposto automaticamente via drag & drop
router.post('/create-from-embarque', async (req, res) => {
  try {
    const {
      embarqueId,
      numeroDA,
      tipoEntreposto,
      empresaEntrepostoId,
      dataRegistroDA,
      observacoes
    } = req.body

    // Validações
    if (!embarqueId || !numeroDA || !tipoEntreposto || !empresaEntrepostoId || !dataRegistroDA) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios não preenchidos'
      })
    }

    // Verificar se embarque existe
    const embarque = await prisma.embarque.findUnique({
      where: { id: embarqueId },
      include: {
        invoices: {
          include: {
            produtos: {
              include: {
                unidadeMedida: true
              }
            }
          }
        }
      }
    })

    if (!embarque) {
      return res.status(404).json({
        success: false,
        message: 'Embarque não encontrado'
      })
    }

    // Verificar se empresa do entreposto existe
    const empresaEntreposto = await prisma.empresaEntreposto.findUnique({
      where: { id: empresaEntrepostoId }
    })

    if (!empresaEntreposto) {
      return res.status(404).json({
        success: false,
        message: 'Empresa de entreposto não encontrada'
      })
    }

    // Verificar se DA já existe
    const daExistente = await prisma.entrepostoAduaneiro.findUnique({
      where: { numeroDA }
    })

    if (daExistente) {
      return res.status(400).json({
        success: false,
        message: 'Número de DA já existe no sistema'
      })
    }

    // Calcular valor total das invoices
    const valorTotal = embarque.invoices.reduce((total, invoice) => {
      return total + Number(invoice.valorTotal)
    }, 0)

    // Calcular prazo de vencimento (180 dias)
    const dataRegistro = new Date(dataRegistroDA)
    const prazoVencimento = new Date(dataRegistro)
    prazoVencimento.setDate(prazoVencimento.getDate() + 180)

    // Criar entreposto com itens em transação
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar entreposto
      const entreposto = await tx.entrepostoAduaneiro.create({
        data: {
          numeroDA,
          tipoEntreposto,
          dataRegistroDA: dataRegistro,
          prazoVencimento,
          valorTotal,
          moeda: embarque.moeda,
          embarqueId,
          empresaEntrepostoId
        }
      })

      // 2. Criar itens do entreposto a partir das invoices
      const itensEntreposto = []
      
      for (const invoice of embarque.invoices) {
        for (const produto of invoice.produtos) {
          const item = await tx.itemEntreposto.create({
            data: {
              descricao: produto.descricao,
              ncm: produto.ncm,
              quantidadeOriginal: Math.floor(Number(produto.quantidade)),
              quantidadeDisponivel: Math.floor(Number(produto.quantidade)),
              valorUnitario: produto.valorUnitario,
              entrepostoId: entreposto.id
            }
          })
          itensEntreposto.push(item)
        }
      }

      // 3. Atualizar status do embarque
      await tx.embarque.update({
        where: { id: embarqueId },
        data: { status: 'ENTRADA_ENTREPOSTO' }
      })

      // 4. Criar histórico de status
      await tx.historicoStatus.create({
        data: {
          embarqueId,
          statusAnterior: embarque.status,
          statusNovo: 'ENTRADA_ENTREPOSTO',
          observacoes: `DA ${numeroDA} criada automaticamente. ${observacoes || ''}`.trim()
        }
      })

      return {
        entreposto,
        itens: itensEntreposto
      }
    })

    return res.json({
      success: true,
      message: 'Entreposto criado com sucesso',
      data: result
    })

  } catch (error) {
    console.error('Erro ao criar entreposto:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})

// Listar entrepostos de um embarque
router.get('/embarque/:embarqueId', async (req, res) => {
  try {
    const { embarqueId } = req.params

    const entrepostos = await prisma.entrepostoAduaneiro.findMany({
      where: { embarqueId },
      include: {
        empresaEntreposto: true,
        itens: true,
        retiradas: {
          include: {
            itens: {
              include: {
                itemOriginal: true
              }
            }
          }
        }
      },
      orderBy: { dataRegistroDA: 'desc' }
    })

    // Calcular saldos disponíveis
    const entrepostosComSaldo = entrepostos.map(entreposto => {
      const saldoTotal = entreposto.itens.reduce((total, item) => {
        return total + item.quantidadeDisponivel
      }, 0)

      const valorDisponivel = entreposto.itens.reduce((total, item) => {
        return total + (item.quantidadeDisponivel * Number(item.valorUnitario))
      }, 0)

      return {
        ...entreposto,
        saldoTotal,
        valorDisponivel,
        diasParaVencimento: Math.ceil(
          (entreposto.prazoVencimento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      }
    })

    return res.json({
      success: true,
      data: entrepostosComSaldo
    })

  } catch (error) {
    console.error('Erro ao listar entrepostos:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Obter detalhes de um entreposto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const entreposto = await prisma.entrepostoAduaneiro.findUnique({
      where: { id },
      include: {
        embarque: {
          include: {
            exportador: true,
            armador: true
          }
        },
        empresaEntreposto: true,
        itens: true,
        retiradas: {
          include: {
            itens: {
              include: {
                itemOriginal: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!entreposto) {
      return res.status(404).json({
        success: false,
        message: 'Entreposto não encontrado'
      })
    }

    // Calcular informações adicionais
    const saldoTotal = entreposto.itens.reduce((total, item) => {
      return total + item.quantidadeDisponivel
    }, 0)

    const valorDisponivel = entreposto.itens.reduce((total, item) => {
      return total + (item.quantidadeDisponivel * Number(item.valorUnitario))
    }, 0)

    const diasParaVencimento = Math.ceil(
      (entreposto.prazoVencimento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )

    return res.json({
      success: true,
      data: {
        ...entreposto,
        saldoTotal,
        valorDisponivel,
        diasParaVencimento
      }
    })

  } catch (error) {
    console.error('Erro ao obter entreposto:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

export default router