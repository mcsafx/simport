import React, { useState, useEffect } from 'react'

interface DAModalData {
  numeroDA: string
  tipoEntreposto: 'CLIA' | 'EADI'
  empresaEntrepostoId: string
  dataRegistroDA: string
  observacoes?: string
}

interface DAModalProps {
  embarqueId: string
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: DAModalData) => Promise<void>
  embarque: any
}

interface EmpresaEntreposto {
  id: string
  nome: string
  cnpj: string
  cidade: string
  estado: string
}

export default function DAModal({ embarqueId, isOpen, onClose, onConfirm, embarque }: DAModalProps) {
  const [loading, setLoading] = useState(false)
  const [empresas, setEmpresas] = useState<EmpresaEntreposto[]>([])
  const [loadingEmpresas, setLoadingEmpresas] = useState(false)
  const [formData, setFormData] = useState<DAModalData>({
    numeroDA: '',
    tipoEntreposto: 'CLIA',
    empresaEntrepostoId: '',
    dataRegistroDA: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (isOpen) {
      carregarEmpresas()
    }
  }, [isOpen])

  const carregarEmpresas = async () => {
    try {
      setLoadingEmpresas(true)
      const response = await fetch('http://localhost:3001/api/cadastros/empresas-entreposto')
      const data = await response.json()
      
      if (data.success) {
        setEmpresas(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    } finally {
      setLoadingEmpresas(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.numeroDA || !formData.empresaEntrepostoId) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    try {
      setLoading(true)
      await onConfirm(formData)
      
      // Reset form
      setFormData({
        numeroDA: '',
        tipoEntreposto: 'CLIA',
        empresaEntrepostoId: '',
        dataRegistroDA: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Erro ao processar DA:', error)
      alert('Erro ao processar DA. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: 'white'
      }}>
        <div style={{ padding: '30px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
              🏭 Registro de DA - Entrada em Entreposto
            </h3>
            <button
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Processando...' : 'Cancelar'}
            </button>
          </div>

          {/* Informações do Embarque */}
          <div style={{ 
            marginBottom: '25px',
            padding: '15px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>📦 Embarque</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div><strong>Referência:</strong> {embarque?.numeroReferencia}</div>
              <div><strong>Exportador:</strong> {embarque?.exportador?.nomeEmpresa}</div>
              <div><strong>Unidade:</strong> {embarque?.unidade === 'CEARA' ? 'Ceará' : 'Santa Catarina'}</div>
            </div>
          </div>

          {/* Formulário DA */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Número DA */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: 'bold' 
                }}>
                  Número da DA *
                </label>
                <input
                  type="text"
                  value={formData.numeroDA}
                  onChange={(e) => setFormData(prev => ({ ...prev, numeroDA: e.target.value }))}
                  placeholder="Ex: DA202500001"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#1f2937',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Tipo Entreposto */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: 'bold' 
                }}>
                  Tipo de Entreposto *
                </label>
                <select
                  value={formData.tipoEntreposto}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tipoEntreposto: e.target.value as 'CLIA' | 'EADI' 
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#1f2937',
                    fontSize: '14px'
                  }}
                >
                  <option value="CLIA">CLIA - Centro Logístico e Industrial Aduaneiro</option>
                  <option value="EADI">EADI - Estação Aduaneira do Interior</option>
                </select>
              </div>

              {/* Empresa Entreposto */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: 'bold' 
                }}>
                  Empresa do Entreposto *
                </label>
                {loadingEmpresas ? (
                  <div style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    background: 'rgba(255,255,255,0.1)', 
                    borderRadius: '6px' 
                  }}>
                    Carregando empresas...
                  </div>
                ) : (
                  <select
                    value={formData.empresaEntrepostoId}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      empresaEntrepostoId: e.target.value 
                    }))}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'rgba(255,255,255,0.9)',
                      color: '#1f2937',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Selecione uma empresa...</option>
                    {empresas.map(empresa => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nome} - {empresa.cidade}/{empresa.estado}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Data Registro */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: 'bold' 
                }}>
                  Data de Registro da DA *
                </label>
                <input
                  type="date"
                  value={formData.dataRegistroDA}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataRegistroDA: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#1f2937',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Observações */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: 'bold' 
                }}>
                  Observações
                </label>
                <textarea
                  value={formData.observacoes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais sobre a DA..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#1f2937',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Informações Automáticas */}
              <div style={{
                padding: '15px',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                border: '2px solid rgba(16, 185, 129, 0.4)'
              }}>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#10b981' }}>
                  ℹ️ Informações Automáticas
                </h5>
                <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <div>• <strong>Prazo de vencimento:</strong> 180 dias a partir da data de registro</div>
                  <div>• <strong>Itens:</strong> Serão criados automaticamente a partir das invoices</div>
                  <div>• <strong>Valor total:</strong> Calculado automaticamente</div>
                </div>
              </div>

              {/* Botões */}
              <div style={{ 
                display: 'flex', 
                gap: '15px', 
                justifyContent: 'flex-end',
                marginTop: '10px'
              }}>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(156, 163, 175, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.numeroDA || !formData.empresaEntrepostoId}
                  style={{
                    padding: '12px 24px',
                    background: loading ? 'rgba(16, 185, 129, 0.6)' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading || !formData.numeroDA || !formData.empresaEntrepostoId ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? '🔄 Processando...' : '✅ Criar DA e Mover para Entreposto'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}