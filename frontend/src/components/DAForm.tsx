import React, { useState, useEffect } from 'react'

interface Embarque {
  id: string
  numeroReferencia: string
  exportador: {
    nomeEmpresa: string
    paisOrigem: string
  }
  frete: number
  moeda: string
  unidade: string
}

interface Props {
  onSave: (data: any) => void
  onCancel: () => void
}

export default function DAForm({ onSave, onCancel }: Props) {
  const [embarques, setEmbarques] = useState<Embarque[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  const [formData, setFormData] = useState({
    embarqueId: '',
    tipoEntreposto: 'CLIA' as 'CLIA' | 'EADI',
    numeroDA: '',
    dataRegistro: new Date().toISOString().split('T')[0],
    observacoes: ''
  })

  useEffect(() => {
    carregarEmbarques()
  }, [])

  const carregarEmbarques = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/embarques')
      const data = await response.json()
      if (data.success) {
        // Filtrar apenas embarques que podem ser admitidos em entreposto
        const embarquesElegiveis = data.data.data.filter((embarque: Embarque) => 
          ['LIBERADO_CARREGAMENTO', 'AGENDAMENTO_RETIRADA'].includes(embarque.status)
        )
        setEmbarques(embarquesElegiveis)
      }
    } catch (error) {
      console.error('Erro ao carregar embarques:', error)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const generateDANumber = () => {
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    return `DA-${year}-${randomNum}`
  }

  const handleGenerateDA = () => {
    const numeroDA = generateDANumber()
    handleInputChange('numeroDA', numeroDA)
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.embarqueId) {
      newErrors.embarqueId = 'Embarque é obrigatório'
    }

    if (!formData.numeroDA.trim()) {
      newErrors.numeroDA = 'Número da D.A. é obrigatório'
    }

    if (!formData.dataRegistro) {
      newErrors.dataRegistro = 'Data de registro é obrigatória'
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
      console.error('Erro ao salvar D.A.:', error)
    } finally {
      setLoading(false)
    }
  }

  const embarqueSelecionado = embarques.find(e => e.id === formData.embarqueId)

  const calcularPrazoVencimento = () => {
    if (!formData.dataRegistro) return ''
    const dataReg = new Date(formData.dataRegistro)
    const prazoVenc = new Date(dataReg)
    prazoVenc.setDate(prazoVenc.getDate() + 180)
    return prazoVenc.toLocaleDateString('pt-BR')
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
    background: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
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
            📄 Nova Declaração de Admissão (D.A.)
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Embarque */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Embarque *
                </label>
                <select
                  value={formData.embarqueId}
                  onChange={(e) => handleInputChange('embarqueId', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Selecione um embarque</option>
                  {embarques.map(embarque => (
                    <option key={embarque.id} value={embarque.id}>
                      {embarque.numeroReferencia} - {embarque.exportador.nomeEmpresa}
                    </option>
                  ))}
                </select>
                {errors.embarqueId && <div style={errorStyle}>{errors.embarqueId}</div>}
                {embarques.length === 0 && (
                  <div style={{ fontSize: '12px', color: '#F59E0B', marginTop: '4px' }}>
                    Nenhum embarque elegível encontrado. Apenas embarques liberados podem ser admitidos.
                  </div>
                )}
              </div>

              {/* Tipo de Entreposto */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Tipo de Entreposto *
                </label>
                <select
                  value={formData.tipoEntreposto}
                  onChange={(e) => handleInputChange('tipoEntreposto', e.target.value)}
                  style={inputStyle}
                >
                  <option value="CLIA">CLIA - Centro Logístico Industrial Aduaneiro</option>
                  <option value="EADI">EADI - Estação Aduaneira de Interior</option>
                </select>
              </div>

              {/* Número da D.A. */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Número da D.A. *
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={formData.numeroDA}
                    onChange={(e) => handleInputChange('numeroDA', e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Ex: DA-2025-0001"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateDA}
                    style={{
                      padding: '12px',
                      background: '#3B82F6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🎲 Gerar
                  </button>
                </div>
                {errors.numeroDA && <div style={errorStyle}>{errors.numeroDA}</div>}
              </div>

              {/* Data de Registro */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Data de Registro *
                </label>
                <input
                  type="date"
                  value={formData.dataRegistro}
                  onChange={(e) => handleInputChange('dataRegistro', e.target.value)}
                  style={inputStyle}
                />
                {errors.dataRegistro && <div style={errorStyle}>{errors.dataRegistro}</div>}
                {formData.dataRegistro && (
                  <div style={{ fontSize: '12px', color: '#10B981', marginTop: '4px' }}>
                    Prazo de vencimento: {calcularPrazoVencimento()} (180 dias)
                  </div>
                )}
              </div>
            </div>

            {/* Informações do Embarque Selecionado */}
            {embarqueSelecionado && (
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 15px 0' }}>📦 Informações do Embarque</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  fontSize: '14px'
                }}>
                  <div>
                    <strong>Referência:</strong><br />
                    {embarqueSelecionado.numeroReferencia}
                  </div>
                  <div>
                    <strong>Exportador:</strong><br />
                    {embarqueSelecionado.exportador.nomeEmpresa}
                  </div>
                  <div>
                    <strong>País:</strong><br />
                    {embarqueSelecionado.exportador.paisOrigem}
                  </div>
                  <div>
                    <strong>Unidade:</strong><br />
                    {embarqueSelecionado.unidade === 'CEARA' ? 'Ceará' : 'Santa Catarina'}
                  </div>
                  <div>
                    <strong>Valor:</strong><br />
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: embarqueSelecionado.moeda
                    }).format(embarqueSelecionado.frete)}
                  </div>
                </div>
              </div>
            )}

            {/* Informações sobre Entreposto */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#3B82F6' }}>ℹ️ Informações Importantes</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                <li>O prazo de permanência em entreposto é de <strong>180 dias</strong> a partir da data de registro</li>
                <li>Mercadorias podem ser retiradas parcialmente durante este período</li>
                <li>Após o prazo, as mercadorias devem ser nacionalizadas ou reexportadas</li>
                <li>{formData.tipoEntreposto === 'CLIA' 
                  ? 'CLIA permite operações de industrialização e beneficiamento'
                  : 'EADI é destinado ao armazenamento e distribuição'
                }</li>
              </ul>
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
                placeholder="Observações sobre a declaração de admissão..."
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
                disabled={loading || embarques.length === 0}
                style={{
                  padding: '12px 24px',
                  background: loading || embarques.length === 0 ? '#666' : '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading || embarques.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Criando...' : 'Criar D.A.'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}