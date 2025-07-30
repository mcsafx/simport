import { Router } from 'express'
import { successResponse, errorResponse } from '../utils/response'
import { StatusEmbarque } from '../types'

const router = Router()

// Mock dashboard data
const mockDashboardData = {
  metrics: {
    totalEmbarques: 24,
    embarquesEmAndamento: 18,
    embarquesComAtraso: 3,
    valorTotalImportacoes: 2400000 // USD
  },
  
  embarquesPorStatus: [
    { status: StatusEmbarque.PRE_EMBARQUE, count: 3 },
    { status: StatusEmbarque.EM_TRANSITO, count: 8 },
    { status: StatusEmbarque.CHEGADA_PORTO, count: 5 },
    { status: StatusEmbarque.REGISTRO_DI, count: 4 },
    { status: StatusEmbarque.ENTREGUE, count: 4 }
  ],
  
  proximasAcoes: [
    {
      id: '1',
      embarqueId: '1',
      numeroReferencia: 'BIO-2024-001',
      acao: 'Registrar DI',
      prazo: new Date('2024-01-28'),
      prioridade: 'alta',
      exportador: 'ChemCorp Industries'
    },
    {
      id: '2',
      embarqueId: '2',
      numeroReferencia: 'BIO-2024-002',
      acao: 'Agendar retirada',
      prazo: new Date('2024-01-30'),
      prioridade: 'media',
      exportador: 'Global Supplies Ltd'
    },
    {
      id: '3',
      embarqueId: '3',
      numeroReferencia: 'BIO-2024-003',
      acao: 'Verificar presença de carga',
      prazo: new Date('2024-02-01'),
      prioridade: 'baixa',
      exportador: 'BioTech Solutions'
    }
  ],
  
  evolucaoMensal: [
    { mes: 'Jan', valor: 800000, embarques: 8 },
    { mes: 'Fev', valor: 950000, embarques: 9 },
    { mes: 'Mar', valor: 1200000, embarques: 12 },
    { mes: 'Abr', valor: 1100000, embarques: 11 },
    { mes: 'Mai', valor: 1350000, embarques: 13 },
    { mes: 'Jun', valor: 1450000, embarques: 15 }
  ]
}

// GET /api/dashboard/metrics
router.get('/metrics', async (req, res) => {
  try {
    return successResponse(res, mockDashboardData.metrics)
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    return errorResponse(res, 'Erro interno do servidor', 500)
  }
})

// GET /api/dashboard/status-overview
router.get('/status-overview', async (req, res) => {
  try {
    return successResponse(res, mockDashboardData.embarquesPorStatus)
  } catch (error) {
    console.error('Dashboard status overview error:', error)
    return errorResponse(res, 'Erro interno do servidor', 500)
  }
})

// GET /api/dashboard/proximas-acoes
router.get('/proximas-acoes', async (req, res) => {
  try {
    return successResponse(res, mockDashboardData.proximasAcoes)
  } catch (error) {
    console.error('Dashboard próximas ações error:', error)
    return errorResponse(res, 'Erro interno do servidor', 500)
  }
})

// GET /api/dashboard/evolucao-mensal
router.get('/evolucao-mensal', async (req, res) => {
  try {
    return successResponse(res, mockDashboardData.evolucaoMensal)
  } catch (error) {
    console.error('Dashboard evolução mensal error:', error)
    return errorResponse(res, 'Erro interno do servidor', 500)
  }
})

// GET /api/dashboard/full
router.get('/full', async (req, res) => {
  try {
    return successResponse(res, mockDashboardData)
  } catch (error) {
    console.error('Dashboard full error:', error)
    return errorResponse(res, 'Erro interno do servidor', 500)
  }
})

export default router