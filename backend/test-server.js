const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()
const PORT = 3001

// Middleware básico
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Biocol Import System API (Test Mode)'
  })
})

// Rotas básicas para testar invoices
app.get('/api/invoices/embarque/:embarqueId', async (req, res) => {
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

    res.json({
      success: true,
      data: invoices
    })
  } catch (error) {
    console.error('Erro ao buscar invoices:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Criar nova invoice
app.post('/api/invoices', async (req, res) => {
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

    console.log('Recebido dados para criar invoice:', {
      numero,
      embarqueId,
      exportadorId,
      produtosCount: produtos?.length,
      containersCount: containers?.length
    })

    // Criar em transação
    const result = await prisma.$transaction(async (prisma) => {
      // Criar invoice
      const novaInvoice = await prisma.invoice.create({
        data: {
          numero,
          dataEmissao: new Date(dataEmissao),
          valorTotal: parseFloat(valorTotal),
          moeda,
          peso: peso ? parseFloat(peso) : null,
          volumes: volumes ? parseInt(volumes) : null,
          observacoes,
          embarqueId,
          exportadorId
        }
      })

      // Criar produtos
      const produtosCriados = await Promise.all(
        produtos.map((produto) =>
          prisma.produto.create({
            data: {
              descricao: produto.descricao,
              ncm: produto.ncm,
              quantidade: parseFloat(produto.quantidade),
              unidadeMedidaId: produto.unidadeMedidaId,
              valorUnitario: parseFloat(produto.valorUnitario),
              valorTotal: parseFloat(produto.valorTotal),
              peso: produto.peso ? parseFloat(produto.peso) : null,
              invoiceId: novaInvoice.id
            }
          })
        )
      )

      // Criar containers
      const containersCriados = await Promise.all(
        containers.map((container) =>
          prisma.container.create({
            data: {
              numero: container.numero,
              tipo: container.tipo,
              tamanho: container.tamanho,
              peso: container.peso ? parseFloat(container.peso) : null,
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

    res.status(201).json({
      success: true,
      data: result,
      message: 'Invoice criada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao criar invoice:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    })
  }
})

// Rotas de cadastros básicas
app.get('/api/cadastros/exportadores', async (req, res) => {
  try {
    const exportadores = await prisma.exportador.findMany({
      where: { ativo: true },
      orderBy: { nomeEmpresa: 'asc' }
    })

    res.json({
      success: true,
      data: exportadores
    })
  } catch (error) {
    console.error('Erro ao buscar exportadores:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

app.get('/api/cadastros/unidades-medida', async (req, res) => {
  try {
    const unidades = await prisma.tipoUnidadeMedidaCadastro.findMany({
      where: { ativo: true },
      orderBy: { codigo: 'asc' }
    })

    res.json({
      success: true,
      data: unidades
    })
  } catch (error) {
    console.error('Erro ao buscar unidades de medida:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Rota básica de embarques
app.get('/api/embarques', async (req, res) => {
  try {
    const embarques = await prisma.embarque.findMany({
      include: {
        exportador: true,
        armador: true,
        portoOrigem: true,
        portoDestino: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: {
        data: embarques,
        pagination: {
          total: embarques.length,
          page: 1,
          limit: 50
        }
      }
    })
  } catch (error) {
    console.error('Erro ao buscar embarques:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Test Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})