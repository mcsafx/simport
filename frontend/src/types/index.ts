// Enums
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

// Main interfaces
export interface Embarque {
  id: string
  numeroReferencia: string
  tipoImportacao: TipoImportacao
  unidade: Unidade
  exportador: Exportador
  armador: string
  frete: number
  moeda: string
  portoOrigemId: string
  portoDestinoId: string
  dataEmbarquePrevista: Date
  dataETAPrevista: Date
  status: StatusEmbarque
  containers: Container[]
  documentos: Documento[]
  createdAt: Date
  updatedAt: Date
}

export interface Exportador {
  id: string
  nomeEmpresa: string
  endereco: Endereco
  contatos: Contato[]
  documentos: string[]
  paisOrigem: string
  produtos: string[]
  observacoes: string
}

export interface Endereco {
  rua: string
  cidade: string
  estado: string
  cep: string
  pais: string
}

export interface Contato {
  id: string
  nome: string
  email: string
  telefone: string
  cargo: string
}

export interface Container {
  id: string
  numero: string
  tipo: string
  tamanho: string
  peso: number
  embarqueId: string
}

export interface Documento {
  id: string
  nome: string
  tipo: string
  url: string
  uploadedAt: Date
  embarqueId: string
}

// Dashboard types
export interface DashboardMetrics {
  totalEmbarques: number
  embarquesEmAndamento: number
  embarquesComAtraso: number
  valorTotalImportacoes: number
  proximasAcoes: ProximaAcao[]
}

export interface ProximaAcao {
  id: string
  embarqueId: string
  numeroReferencia: string
  acao: string
  prazo: Date
  prioridade: 'alta' | 'media' | 'baixa'
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form types
export interface EmbarqueFormData {
  numeroReferencia: string
  tipoImportacao: TipoImportacao
  unidade: Unidade
  exportadorId: string
  armador: string
  frete: number
  moeda: string
  portoOrigemId: string
  portoDestinoId: string
  dataEmbarquePrevista: string
  dataETAPrevista: string
}

// Auth types
export interface User {
  id: string
  nome: string
  email: string
  role: 'admin' | 'coordenador' | 'operador' | 'visualizador'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}