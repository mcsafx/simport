export enum StatusEmbarque {
  PRE_EMBARQUE = 'PRE_EMBARQUE',
  CARREGADO_BORDO = 'CARREGADO_BORDO',
  EM_TRANSITO = 'EM_TRANSITO',
  CHEGADA_PORTO = 'CHEGADA_PORTO',
  PRESENCA_CARGA = 'PRESENCA_CARGA',
  REGISTRO_DI = 'REGISTRO_DI',
  CANAL_PARAMETRIZADO = 'CANAL_PARAMETRIZADO',
  LIBERADO_CARREGAMENTO = 'LIBERADO_CARREGAMENTO',
  AGENDAMENTO_RETIRADA = 'AGENDAMENTO_RETIRADA',
  ENTREGUE = 'ENTREGUE'
}

export enum TipoImportacao {
  CONTA_PROPRIA = 'CONTA_PROPRIA',
  VIA_TRADE = 'VIA_TRADE'
}

export enum Unidade {
  CEARA = 'CEARA',
  SANTA_CATARINA = 'SANTA_CATARINA'
}

export enum UserRole {
  ADMIN = 'admin',
  COORDENADOR = 'coordenador',
  OPERADOR = 'operador',
  VISUALIZADOR = 'visualizador'
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

export interface AuthRequest extends Request {
  user?: JWTPayload
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginationQuery {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface EmbarqueFilters {
  unidade?: Unidade
  status?: StatusEmbarque
  tipoImportacao?: TipoImportacao
  exportadorId?: string
  dataInicio?: Date
  dataFim?: Date
}