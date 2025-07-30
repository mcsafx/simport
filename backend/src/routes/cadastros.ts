import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Exportadores
router.get('/exportadores', async (req, res) => {
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

router.post('/exportadores', async (req, res) => {
  try {
    const {
      nomeEmpresa,
      pais,
      codigoERP
    } = req.body

    if (!nomeEmpresa || !pais) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nomeEmpresa, pais'
      })
    }

    const exportador = await prisma.exportador.create({
      data: {
        nomeEmpresa,
        pais,
        codigoERP
      }
    })

    return res.status(201).json({
      success: true,
      data: exportador
    })
  } catch (error) {
    console.error('Erro ao criar exportador:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Armadores
router.get('/armadores', async (req, res) => {
  try {
    const armadores = await prisma.armador.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    })

    res.json({
      success: true,
      data: armadores
    })
  } catch (error) {
    console.error('Erro ao buscar armadores:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

router.post('/armadores', async (req, res) => {
  try {
    const {
      nome,
      linkTracking
    } = req.body

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Campo obrigatório: nome'
      })
    }

    const armador = await prisma.armador.create({
      data: {
        nome,
        linkTracking
      }
    })

    return res.status(201).json({
      success: true,
      data: armador
    })
  } catch (error) {
    console.error('Erro ao criar armador:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Moedas
router.get('/moedas', async (req, res) => {
  try {
    const moedas = await prisma.moeda.findMany({
      where: { ativo: true },
      orderBy: { codigo: 'asc' }
    })

    res.json({
      success: true,
      data: moedas
    })
  } catch (error) {
    console.error('Erro ao buscar moedas:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

router.post('/moedas', async (req, res) => {
  try {
    const { codigo, nome, simbolo } = req.body

    if (!codigo || !nome || !simbolo) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: codigo, nome, simbolo'
      })
    }

    const moeda = await prisma.moeda.create({
      data: {
        codigo: codigo.toUpperCase(),
        nome,
        simbolo
      }
    })

    return res.status(201).json({
      success: true,
      data: moeda
    })
  } catch (error) {
    console.error('Erro ao criar moeda:', error)
    if ((error as any).code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Código da moeda já existe'
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Portos
router.get('/portos', async (req, res) => {
  try {
    const portos = await prisma.porto.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    })

    res.json({
      success: true,
      data: portos
    })
  } catch (error) {
    console.error('Erro ao buscar portos:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

router.post('/portos', async (req, res) => {
  try {
    const { nome, codigo, pais, cidade } = req.body

    if (!nome || !codigo || !pais || !cidade) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nome, codigo, pais, cidade'
      })
    }

    const porto = await prisma.porto.create({
      data: {
        nome,
        codigo: codigo.toUpperCase(),
        pais,
        cidade
      }
    })

    return res.status(201).json({
      success: true,
      data: porto
    })
  } catch (error) {
    console.error('Erro ao criar porto:', error)
    if ((error as any).code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Código do porto já existe'
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Unidades de Medida
router.get('/unidades-medida', async (req, res) => {
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

router.post('/unidades-medida', async (req, res) => {
  try {
    const { codigo, nome, simbolo } = req.body

    if (!codigo || !nome || !simbolo) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: codigo, nome, simbolo'
      })
    }

    const unidade = await prisma.tipoUnidadeMedidaCadastro.create({
      data: {
        codigo: codigo.toUpperCase(),
        nome,
        simbolo
      }
    })

    return res.status(201).json({
      success: true,
      data: unidade
    })
  } catch (error) {
    console.error('Erro ao criar unidade de medida:', error)
    if ((error as any).code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Código da unidade já existe'
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Empresas de Entrepostos
router.get('/empresas-entreposto', async (req, res) => {
  try {
    const empresas = await prisma.empresaEntreposto.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    })

    res.json({
      success: true,
      data: empresas
    })
  } catch (error) {
    console.error('Erro ao buscar empresas de entreposto:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

router.post('/empresas-entreposto', async (req, res) => {
  try {
    const {
      nome,
      cnpj,
      cidade,
      estado,
      cep,
      endereco,
      email,
      telefone,
      contato,
      observacoes
    } = req.body

    if (!nome || !cnpj || !cidade || !estado || !cep || !endereco) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nome, cnpj, cidade, estado, cep, endereco'
      })
    }

    const empresa = await prisma.empresaEntreposto.create({
      data: {
        nome,
        cnpj,
        cidade,
        estado,
        cep,
        endereco,
        email,
        telefone,
        contato,
        observacoes
      }
    })

    return res.status(201).json({
      success: true,
      data: empresa
    })
  } catch (error) {
    console.error('Erro ao criar empresa de entreposto:', error)
    if ((error as any).code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'CNPJ já cadastrado'
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

export default router