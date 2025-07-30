import React, { useState, useEffect } from 'react'

interface Exportador {
  id: string
  nomeEmpresa: string
  paisOrigem: string
}

interface EmbarqueFormData {
  numeroReferencia: string
  referenciaExterna: string
  tipoImportacao: 'CONTA_PROPRIA' | 'VIA_TRADE'
  unidade: 'CEARA' | 'SANTA_CATARINA'
  exportadorId: string
  armador: string
  frete: number
  moeda: string
  dataETAPrevista: string
  portoOrigemNome: string
  portoOrigemCodigo: string
  portoDestinoNome: string
  portoDestinoCodigo: string
  status: string
  observacoes: string
}

interface Props {
  embarque?: any
  onSave: (data: EmbarqueFormData) => void
  onCancel: () => void
}

const statusOptions = [
  { value: 'PRE_EMBARQUE', label: 'Pré Embarque' },
  { value: 'CARREGADO_BORDO', label: 'Carregado a Bordo' },
  { value: 'EM_TRANSITO', label: 'Em Trânsito' },
  { value: 'CHEGADA_PORTO', label: 'Chegada ao Porto' },
  { value: 'PRESENCA_CARGA', label: 'Presença de Carga' },
  { value: 'REGISTRO_DI', label: 'Registro DI' },
  { value: 'CANAL_PARAMETRIZADO', label: 'Canal Parametrizado' },
  { value: 'LIBERADO_CARREGAMENTO', label: 'Liberado p/ Carregamento' },
  { value: 'AGENDAMENTO_RETIRADA', label: 'Agendamento de Retirada' },
  { value: 'ENTREGUE', label: 'Entregue' }
]

export default function EmbarqueForm({ embarque, onSave, onCancel }: Props) {
  const [exportadores, setExportadores] = useState<Exportador[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  const [formData, setFormData] = useState<EmbarqueFormData>({
    numeroReferencia: embarque?.numeroReferencia || '',
    referenciaExterna: embarque?.referenciaExterna || '',
    tipoImportacao: embarque?.tipoImportacao || 'CONTA_PROPRIA',
    unidade: embarque?.unidade || 'CEARA',
    exportadorId: embarque?.exportador?.id || '',
    armador: embarque?.armador || '',
    frete: embarque?.frete || 0,
    moeda: embarque?.moeda || 'USD',
    dataETAPrevista: embarque?.dataETAPrevista ? 
      new Date(embarque.dataETAPrevista).toISOString().split('T')[0] : '',
    portoOrigemNome: embarque?.portoOrigem?.nome || '',
    portoOrigemCodigo: embarque?.portoOrigem?.codigo || '',
    portoDestinoNome: embarque?.portoDestino?.nome || '',
    portoDestinoCodigo: embarque?.portoDestino?.codigo || '',
    status: embarque?.status || 'PRE_EMBARQUE',
    observacoes: embarque?.observacoes || ''
  })

  useEffect(() => {
    carregarExportadores()
  }, [])

  const carregarExportadores = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/exportadores')
      const data = await response.json()
      if (data.success) {
        setExportadores(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar exportadores:', error)
    }
  }

  const handleInputChange = (field: keyof EmbarqueFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.numeroReferencia.trim()) {
      newErrors.numeroReferencia = 'Número de referência é obrigatório'
    }

    if (!formData.exportadorId) {
      newErrors.exportadorId = 'Exportador é obrigatório'
    }

    if (!formData.armador.trim()) {
      newErrors.armador = 'Armador é obrigatório'
    }

    if (formData.frete <= 0) {
      newErrors.frete = 'Valor do frete deve ser maior que zero'
    }

    if (!formData.dataETAPrevista) {
      newErrors.dataETAPrevista = 'Data ETA é obrigatória'
    }

    if (!formData.portoOrigemNome.trim()) {
      newErrors.portoOrigemNome = 'Porto de origem é obrigatório'
    }

    if (!formData.portoDestinoNome.trim()) {
      newErrors.portoDestinoNome = 'Porto de destino é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Erro ao salvar embarque:', error)
    } finally {
      setLoading(false)
    }
  }

  const formStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    overflowY: 'auto' as const
  }

  const modalStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    color: 'white'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  }

  const errorStyle = {
    color: '#ffcdd2',
    fontSize: '12px',
    marginTop: '4px'
  }

  return (
    <div style={formStyle}>
      <div style={modalStyle}>
        <div style={{ padding: '30px' }}>
          <h2 style={{ margin: '0 0 30px 0', fontSize: '1.5rem' }}>
            {embarque ? 'Editar Embarque' : 'Novo Embarque'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Número de Referência */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Número de Referência *
                </label>
                <input
                  type="text"
                  value={formData.numeroReferencia}
                  onChange={(e) => handleInputChange('numeroReferencia', e.target.value)}
                  style={inputStyle}
                  placeholder="Ex: BIO-2025-001"
                />
                {errors.numeroReferencia && <div style={errorStyle}>{errors.numeroReferencia}</div>}
              </div>

              {/* Referência Externa */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Referência Externa
                </label>
                <input
                  type="text"
                  value={formData.referenciaExterna}
                  onChange={(e) => handleInputChange('referenciaExterna', e.target.value)}
                  style={inputStyle}
                  placeholder="Referência do despachante/trade"
                />
              </div>

              {/* Tipo de Importação */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Tipo de Importação *
                </label>
                <select
                  value={formData.tipoImportacao}
                  onChange={(e) => handleInputChange('tipoImportacao', e.target.value)}
                  style={inputStyle}
                >
                  <option value="CONTA_PROPRIA">Conta Própria</option>
                  <option value="VIA_TRADE">Via Trade</option>
                </select>
              </div>

              {/* Unidade */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Unidade *
                </label>
                <select
                  value={formData.unidade}
                  onChange={(e) => handleInputChange('unidade', e.target.value)}
                  style={inputStyle}
                >
                  <option value="CEARA">Ceará</option>
                  <option value="SANTA_CATARINA">Santa Catarina</option>
                </select>
              </div>

              {/* Exportador */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Exportador *
                </label>
                <select
                  value={formData.exportadorId}
                  onChange={(e) => handleInputChange('exportadorId', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Selecione um exportador</option>
                  {exportadores.map(exp => (
                    <option key={exp.id} value={exp.id}>
                      {exp.nomeEmpresa} - {exp.paisOrigem}
                    </option>
                  ))}
                </select>
                {errors.exportadorId && <div style={errorStyle}>{errors.exportadorId}</div>}
              </div>

              {/* Armador */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Armador *
                </label>
                <input
                  type="text"
                  value={formData.armador}
                  onChange={(e) => handleInputChange('armador', e.target.value)}
                  style={inputStyle}
                  placeholder="Ex: Maersk Line"
                />
                {errors.armador && <div style={errorStyle}>{errors.armador}</div>}
              </div>

              {/* Frete */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Valor do Frete *
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.frete}
                    onChange={(e) => handleInputChange('frete', parseFloat(e.target.value) || 0)}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="0.00"
                  />
                  <select
                    value={formData.moeda}
                    onChange={(e) => handleInputChange('moeda', e.target.value)}
                    style={{ ...inputStyle, width: '80px' }}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="BRL">BRL</option>
                  </select>
                </div>
                {errors.frete && <div style={errorStyle}>{errors.frete}</div>}
              </div>

              {/* Data ETA */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Data ETA Prevista *
                </label>
                <input
                  type="date"
                  value={formData.dataETAPrevista}
                  onChange={(e) => handleInputChange('dataETAPrevista', e.target.value)}
                  style={inputStyle}
                />
                {errors.dataETAPrevista && <div style={errorStyle}>{errors.dataETAPrevista}</div>}
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  style={inputStyle}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Portos */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Porto de Origem */}
              <div>
                <h4 style={{ margin: '0 0 15px 0' }}>Porto de Origem</h4>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.portoOrigemNome}
                    onChange={(e) => handleInputChange('portoOrigemNome', e.target.value)}
                    style={inputStyle}
                    placeholder="Ex: Shanghai Port"
                  />
                  {errors.portoOrigemNome && <div style={errorStyle}>{errors.portoOrigemNome}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Código
                  </label>
                  <input
                    type="text"
                    value={formData.portoOrigemCodigo}
                    onChange={(e) => handleInputChange('portoOrigemCodigo', e.target.value)}
                    style={inputStyle}
                    placeholder="Ex: CNSHA"
                  />
                </div>
              </div>

              {/* Porto de Destino */}
              <div>
                <h4 style={{ margin: '0 0 15px 0' }}>Porto de Destino</h4>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.portoDestinoNome}
                    onChange={(e) => handleInputChange('portoDestinoNome', e.target.value)}
                    style={inputStyle}
                    placeholder="Ex: Porto de Itajai"
                  />
                  {errors.portoDestinoNome && <div style={errorStyle}>{errors.portoDestinoNome}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Código
                  </label>
                  <input
                    type="text"
                    value={formData.portoDestinoCodigo}
                    onChange={(e) => handleInputChange('portoDestinoCodigo', e.target.value)}
                    style={inputStyle}
                    placeholder="Ex: BRITJ"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                style={{
                  ...inputStyle,
                  height: '80px',
                  resize: 'vertical' as const
                }}
                placeholder="Observações adicionais sobre o embarque..."
              />
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: loading ? '#666' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}