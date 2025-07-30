import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { successResponse, errorResponse } from '../utils/response'
import { StatusEmbarque, TipoImportacao, Unidade } from '../types'

const router = Router()
const prisma = new PrismaClient()

// Mock data for MVP
const mockEmbarques = [
  {
    id: '1',
    numeroReferencia: 'BIO-2024-001',
    tipoImportacao: TipoImportacao.CONTA_PROPRIA,
    unidade: Unidade.CEARA,
    exportador: { id: '1', nomeEmpresa: 'ChemCorp Industries' },
    armador: 'Maersk Line',
    status: StatusEmbarque.EM_TRANSITO,
    dataETAPrevista: new Date('2024-01-30'),
    frete: 15000,
    moeda: 'USD',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    numeroReferencia: 'BIO-2024-002',
    tipoImportacao: TipoImportacao.VIA_TRADE,
    unidade: Unidade.SANTA_CATARINA,
    exportador: { id: '2', nomeEmpresa: 'Global Supplies Ltd' },
    armador: 'MSC',
    status: StatusEmbarque.CHEGADA_PORTO,
    dataETAPrevista: new Date('2024-01-28'),
    frete: 22000,
    moeda: 'USD',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    numeroReferencia: 'BIO-2024-003',
    tipoImportacao: TipoImportacao.CONTA_PROPRIA,
    unidade: Unidade.CEARA,
    exportador: { id: '3', nomeEmpresa: 'BioTech Solutions' },
    armador: 'CMA CGM',
    status: StatusEmbarque.PRESENCA_CARGA,
    dataETAPrevista: new Date('2024-02-01'),
    frete: 18500,
    moeda: 'USD',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const embarqueQuerySchema = z.object({
  page: z.string().transform(Number).optional().default(1),
  limit: z.string().transform(Number).optional().default(10),
  unidade: z.nativeEnum(Unidade).optional(),
  status: z.nativeEnum(StatusEmbarque).optional(),
  tipoImportacao: z.nativeEnum(TipoImportacao).optional()
}).transform(data => ({
  ...data,
  page: data.page || 1,
  limit: data.limit || 10
}))

// GET /api/embarques
router.get('/', async (req, res) => {
  try {
    const query = embarqueQuerySchema.parse(req.query)
    
    let filteredEmbarques = [...mockEmbarques]
    
    // Apply filters
    if (query.unidade) {
      filteredEmbarques = filteredEmbarques.filter(e => e.unidade === query.unidade)
    }
    if (query.status) {
      filteredEmbarques = filteredEmbarques.filter(e => e.status === query.status)
    }
    if (query.tipoImportacao) {
      filteredEmbarques = filteredEmbarques.filter(e => e.tipoImportacao === query.tipoImportacao)
    }
    
    // Pagination
    const startIndex = (query.page - 1) * query.limit
    const endIndex = startIndex + query.limit
    const paginatedEmbarques = filteredEmbarques.slice(startIndex, endIndex)
    
    return successResponse(res, {
      data: paginatedEmbarques,
      pagination: {
        total: filteredEmbarques.length,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(filteredEmbarques.length / query.limit)
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'Parâmetros inválidos', 400, error.issues[0].message)
    }
    
    console.error('Embarques list error:', error)
    return errorResponse(res, 'Erro interno do servidor', 500)
  }
})

// GET /api/embarques/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const embarque = mockEmbarques.find(e => e.id === id)
    
    if (!embarque) {
      return errorResponse(res, 'Embarque não encontrado', 404)
    }
    
    return successResponse(res, embarque)
    
  } catch (error) {
    console.error('Embarque detail error:', error)
    return errorResponse(res, 'Erro interno do servidor', 500)
  }
})

const createEmbarqueSchema = z.object({
  numeroReferencia: z.string().min(1, 'Número de referência é obrigatório'),
  tipoImportacao: z.nativeEnum(TipoImportacao),
  unidade: z.nativeEnum(Unidade),
  exportadorId: z.string().min(1, 'Exportador é obrigatório'),
  armador: z.string().min(1, 'Armador é obrigatório'),
  frete: z.number().positive('Frete deve ser positivo'),
  moeda: z.string().default('USD'),
  dataEmbarquePrevista: z.string().transform(str => new Date(str)),
  dataETAPrevista: z.string().transform(str => new Date(str)),
  portoOrigemId: z.string().min(1, 'Porto de origem é obrigatório'),
  portoDestinoId: z.string().min(1, 'Porto de destino é obrigatório')
})

// POST /api/embarques
router.post('/', async (req, res) => {
  try {
    const data = createEmbarqueSchema.parse(req.body)
    
    // Mock creation for MVP
    const newEmbarque = {
      id: String(mockEmbarques.length + 1),
      ...data,
      status: StatusEmbarque.PRE_EMBARQUE,
      exportador: { id: data.exportadorId, nomeEmpresa: 'Mock Exportador' },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    mockEmbarques.push(newEmbarque)
    
    return successResponse(res, newEmbarque, 'Embarque criado com sucesso', 201)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'Dados inválidos', 400, error.issues[0].message)
    }
    
    console.error('Create embarque error:', error)
    return errorResponse(res, 'Erro interno do servidor', 500)
  }
})

export default router