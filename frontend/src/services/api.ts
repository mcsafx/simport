import { ApiResponse, PaginatedResponse } from '../types'

const API_BASE_URL = 'http://localhost:3001/api'

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async verifyToken(token: string) {
    return this.request<{ user: any }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  // Embarques
  async getEmbarques(params?: {
    page?: number
    limit?: number
    unidade?: string
    status?: string
    tipoImportacao?: string
  }) {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = `/embarques${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<any>>(endpoint)
  }

  async getEmbarque(id: string) {
    return this.request<any>(`/embarques/${id}`)
  }

  async createEmbarque(data: any) {
    return this.request<any>('/embarques', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Dashboard
  async getDashboardMetrics() {
    return this.request<{
      totalEmbarques: number
      embarquesEmAndamento: number
      embarquesComAtraso: number
      valorTotalImportacoes: number
    }>('/dashboard/metrics')
  }

  async getDashboardStatusOverview() {
    return this.request<Array<{ status: string; count: number }>>('/dashboard/status-overview')
  }

  async getDashboardProximasAcoes() {
    return this.request<Array<{
      id: string
      embarqueId: string
      numeroReferencia: string
      acao: string
      prazo: string
      prioridade: string
      exportador: string
    }>>('/dashboard/proximas-acoes')
  }
}

export const apiService = new ApiService()
export default apiService