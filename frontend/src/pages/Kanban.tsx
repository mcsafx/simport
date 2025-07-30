import React, { useState, useEffect } from 'react'
import InvoiceForm from '../components/InvoiceForm'

interface Embarque {
  id: string
  numeroReferencia: string
  tipoImportacao: 'CONTA_PROPRIA' | 'VIA_TRADE'
  unidade: 'CEARA' | 'SANTA_CATARINA'
  exportador: {
    nomeEmpresa: string
    paisOrigem: string
  }
  armador: string
  frete: number
  moeda: string
  dataETAPrevista: string
  status: string
  observacoes: string
}

const statusConfig = {
  'PRE_EMBARQUE': { 
    label: 'Pré Embarque', 
    color: '#6B7280',
    icon: '📋'
  },
  'CARREGADO_BORDO': { 
    label: 'Carregado', 
    color: '#3B82F6',
    icon: '🚢'
  },
  'EM_TRANSITO': { 
    label: 'Em Trânsito', 
    color: '#F59E0B',
    icon: '🌊'
  },
  'CHEGADA_PORTO': { 
    label: 'Chegada Porto', 
    color: '#F97316',
    icon: '🏢'
  },
  'PRESENCA_CARGA': { 
    label: 'Presença Carga', 
    color: '#8B5CF6',
    icon: '📦'
  },
  'REGISTRO_DI': { 
    label: 'Registro DI', 
    color: '#6366F1',
    icon: '📄'
  },
  'CANAL_PARAMETRIZADO': { 
    label: 'Canal Param.', 
    color: '#EC4899',
    icon: '🔍'
  },
  'LIBERADO_CARREGAMENTO': { 
    label: 'Liberado', 
    color: '#10B981',
    icon: '✅'
  },
  'AGENDAMENTO_RETIRADA': { 
    label: 'Agendamento', 
    color: '#14B8A6',
    icon: '📅'
  },
  'ENTREGUE': { 
    label: 'Entregue', 
    color: '#059669',
    icon: '🎉'
  },
  // Novos status para fluxo de entreposto
  'ENTRADA_ENTREPOSTO': {
    label: 'Entrada Entreposto',
    color: '#7C3AED',
    icon: '🏭'
  },
  'AGUARDANDO_NACIONALIZACAO': {
    label: 'Aguard. Nacional.',
    color: '#DC2626',
    icon: '⏳'
  },
  'NACIONALIZACAO_PARCIAL': {
    label: 'Nacional. Parcial',
    color: '#EA580C',
    icon: '📊'
  },
  'NACIONALIZACAO_COMPLETA': {
    label: 'Nacional. Completa',
    color: '#16A34A',
    icon: '✅'
  }
}

const statusOrder = [
  'PRE_EMBARQUE',
  'CARREGADO_BORDO', 
  'EM_TRANSITO',
  'CHEGADA_PORTO',
  'PRESENCA_CARGA',
  'REGISTRO_DI',
  'CANAL_PARAMETRIZADO',
  'LIBERADO_CARREGAMENTO',
  'AGENDAMENTO_RETIRADA',
  'ENTREGUE',
  // Novos status para fluxo de entreposto
  'ENTRADA_ENTREPOSTO',
  'AGUARDANDO_NACIONALIZACAO',
  'NACIONALIZACAO_PARCIAL',
  'NACIONALIZACAO_COMPLETA'
]

export default function Kanban() {
  const [embarques, setEmbarques] = useState<Embarque[]>([])
  const [embarquesFiltrados, setEmbarquesFiltrados] = useState<Embarque[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [selectedEmbarque, setSelectedEmbarque] = useState<Embarque | null>(null)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  
  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    unidade: '',
    tipoImportacao: '',
    armador: '',
    exportador: '',
    status: '',
    atrasados: false
  })

  useEffect(() => {
    carregarEmbarques()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [embarques, filtros])

  const aplicarFiltros = () => {
    let resultado = [...embarques]

    if (filtros.unidade) {
      resultado = resultado.filter(e => e.unidade === filtros.unidade)
    }

    if (filtros.tipoImportacao) {
      resultado = resultado.filter(e => e.tipoImportacao === filtros.tipoImportacao)
    }

    if (filtros.armador) {
      resultado = resultado.filter(e => 
        e.armador.toLowerCase().includes(filtros.armador.toLowerCase())
      )
    }

    if (filtros.exportador) {
      resultado = resultado.filter(e => 
        e.exportador.nomeEmpresa.toLowerCase().includes(filtros.exportador.toLowerCase())
      )
    }

    if (filtros.status) {
      resultado = resultado.filter(e => e.status === filtros.status)
    }

    if (filtros.atrasados) {
      resultado = resultado.filter(e => calcularDiasAtraso(e.dataETAPrevista) > 0)
    }

    setEmbarquesFiltrados(resultado)
  }

  const limparFiltros = () => {
    setFiltros({
      unidade: '',
      tipoImportacao: '',
      armador: '',
      exportador: '',
      status: '',
      atrasados: false
    })
  }

  const obterValoresUnicos = (campo: string) => {
    const valores = new Set()
    embarques.forEach(embarque => {
      if (campo === 'armador') {
        valores.add(embarque.armador)
      } else if (campo === 'exportador') {
        valores.add(embarque.exportador.nomeEmpresa)
      }
    })
    return Array.from(valores).sort()
  }

  const carregarInvoices = async (embarqueId: string) => {
    try {
      setLoadingInvoices(true)
      const response = await fetch(`http://localhost:3001/api/invoices/embarque/${embarqueId}`)
      const data = await response.json()

      if (data.success) {
        setInvoices(data.data)
      } else {
        setInvoices([])
      }
    } catch (error) {
      console.error('Erro ao carregar invoices:', error)
      setInvoices([])
    } finally {
      setLoadingInvoices(false)
    }
  }

  const handleOpenEmbarqueDetails = async (embarque: Embarque) => {
    setSelectedEmbarque(embarque)
    await carregarInvoices(embarque.id)
  }

  const handleCloseInvoiceForm = () => {
    setShowInvoiceForm(false)
  }

  const handleSaveInvoice = async () => {
    setShowInvoiceForm(false)
    if (selectedEmbarque) {
      await carregarInvoices(selectedEmbarque.id)
    }
  }

  const carregarEmbarques = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/embarques')
      const data = await response.json()

      if (data.success) {
        setEmbarques(data.data.data)
        setEmbarquesFiltrados(data.data.data)
      } else {
        setError('Erro ao carregar embarques')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (dataStr: string) => {
    if (!dataStr) return '-'
    return new Date(dataStr).toLocaleDateString('pt-BR')
  }

  const formatarMoeda = (valor: number, moeda: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: moeda === 'USD' ? 'USD' : moeda === 'EUR' ? 'EUR' : 'BRL'
    }).format(valor)
  }

  const calcularDiasAtraso = (dataETA: string) => {
    const hoje = new Date()
    const eta = new Date(dataETA)
    const diffTime = hoje.getTime() - eta.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const handleDragStart = (e: React.DragEvent, embarqueId: string) => {
    setDraggedItem(embarqueId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    
    if (!draggedItem) return

    try {
      const response = await fetch(`http://localhost:3001/api/embarques/${draggedItem}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        setEmbarques(prev => 
          prev.map(embarque => 
            embarque.id === draggedItem 
              ? { ...embarque, status: newStatus }
              : embarque
          )
        )
      } else {
        setError('Erro ao atualizar status do embarque')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    }

    setDraggedItem(null)
  }

  const agruparPorStatus = () => {
    const grupos: { [key: string]: Embarque[] } = {}
    
    statusOrder.forEach(status => {
      grupos[status] = embarquesFiltrados.filter(embarque => embarque.status === status)
    })
    
    return grupos
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
        minHeight: '100vh',
        color: 'white'
      }}>
        <h2>Carregando board Kanban...</h2>
      </div>
    )
  }

  const gruposEmbarques = agruparPorStatus()

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>
          📋 Board Kanban - Workflow de Embarques
        </h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', opacity: 0.8 }}>
            {embarquesFiltrados.length} de {embarques.length} embarques
          </span>
          <button
            onClick={carregarEmbarques}
            style={{
              padding: '8px 16px',
              background: 'rgba(59, 130, 246, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '15px', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            🔍 Filtros
          </h3>
          
          {/* Filtro Unidade */}
          <select
            value={filtros.unidade}
            onChange={(e) => setFiltros(prev => ({ ...prev, unidade: e.target.value }))}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              color: '#1f2937',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="">Todas as Unidades</option>
            <option value="CEARA">Ceará</option>
            <option value="SANTA_CATARINA">Santa Catarina</option>
          </select>

          {/* Filtro Tipo Importação */}
          <select
            value={filtros.tipoImportacao}
            onChange={(e) => setFiltros(prev => ({ ...prev, tipoImportacao: e.target.value }))}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              color: '#1f2937',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="">Todos os Tipos</option>
            <option value="CONTA_PROPRIA">Conta Própria</option>
            <option value="VIA_TRADE">Via Trade</option>
          </select>

          {/* Filtro Status */}
          <select
            value={filtros.status}
            onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              color: '#1f2937',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="">Todos os Status</option>
            {statusOrder.map(status => (
              <option key={status} value={status}>
                {statusConfig[status].label}
              </option>
            ))}
          </select>

          {/* Filtro Armador */}
          <select
            value={filtros.armador}
            onChange={(e) => setFiltros(prev => ({ ...prev, armador: e.target.value }))}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              color: '#1f2937',
              fontSize: '14px',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            <option value="">Todos os Armadores</option>
            {obterValoresUnicos('armador').map(armador => (
              <option key={armador} value={armador}>
                {armador}
              </option>
            ))}
          </select>

          {/* Filtro Exportador */}
          <select
            value={filtros.exportador}
            onChange={(e) => setFiltros(prev => ({ ...prev, exportador: e.target.value }))}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              color: '#1f2937',
              fontSize: '14px',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            <option value="">Todos os Exportadores</option>
            {obterValoresUnicos('exportador').map(exportador => (
              <option key={exportador} value={exportador}>
                {exportador}
              </option>
            ))}
          </select>

          {/* Checkbox Atrasados */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={filtros.atrasados}
              onChange={(e) => setFiltros(prev => ({ ...prev, atrasados: e.target.checked }))}
              style={{ cursor: 'pointer' }}
            />
            ⚠️ Apenas Atrasados
          </label>

          {/* Botão Limpar */}
          <button
            onClick={limparFiltros}
            style={{
              padding: '8px 16px',
              background: 'rgba(156, 163, 175, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🧹 Limpar Filtros
          </button>
        </div>

        {/* Indicadores de filtros ativos */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {filtros.unidade && (
            <span style={{
              background: 'rgba(59, 130, 246, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Unidade: {filtros.unidade === 'CEARA' ? 'Ceará' : 'Santa Catarina'}
            </span>
          )}
          {filtros.tipoImportacao && (
            <span style={{
              background: 'rgba(16, 185, 129, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Tipo: {filtros.tipoImportacao === 'CONTA_PROPRIA' ? 'Conta Própria' : 'Via Trade'}
            </span>
          )}
          {filtros.status && (
            <span style={{
              background: 'rgba(139, 92, 246, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Status: {statusConfig[filtros.status]?.label}
            </span>
          )}
          {filtros.armador && (
            <span style={{
              background: 'rgba(245, 158, 11, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Armador: {filtros.armador}
            </span>
          )}
          {filtros.exportador && (
            <span style={{
              background: 'rgba(236, 72, 153, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Exportador: {filtros.exportador}
            </span>
          )}
          {filtros.atrasados && (
            <span style={{
              background: 'rgba(220, 38, 38, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              ⚠️ Apenas Atrasados
            </span>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(244, 67, 54, 0.8)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Kanban Board */}
      <div style={{
        display: 'flex',
        gap: '20px',
        overflowX: 'auto',
        paddingBottom: '20px'
      }}>
        {statusOrder.map(status => {
          const config = statusConfig[status]
          const embarquesNoStatus = gruposEmbarques[status] || []
          
          return (
            <div
              key={status}
              style={{
                minWidth: '280px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                padding: '15px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column'
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Cabeçalho da Coluna */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
                padding: '10px',
                background: `${config.color}33`,
                borderRadius: '8px',
                border: `2px solid ${config.color}66`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{config.icon}</span>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    color: config.color
                  }}>
                    {config.label}
                  </h3>
                </div>
                <span style={{
                  background: config.color,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {embarquesNoStatus.length}
                </span>
              </div>

              {/* Cards dos Embarques */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {embarquesNoStatus.map(embarque => {
                  const diasAtraso = calcularDiasAtraso(embarque.dataETAPrevista)
                  
                  return (
                    <div
                      key={embarque.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, embarque.id)}
                      onClick={() => handleOpenEmbarqueDetails(embarque)}
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                        color: '#1f2937',
                        padding: '15px',
                        borderRadius: '8px',
                        cursor: 'grab',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: draggedItem === embarque.id ? '2px solid #3B82F6' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Header do Card */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '10px'
                      }}>
                        <div>
                          <h4 style={{ 
                            margin: '0 0 4px 0', 
                            fontSize: '16px', 
                            fontWeight: 'bold',
                            color: '#1f2937'
                          }}>
                            {embarque.numeroReferencia}
                          </h4>
                          <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            background: embarque.tipoImportacao === 'CONTA_PROPRIA' ? '#dcfce7' : '#dbeafe',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}>
                            {embarque.tipoImportacao === 'CONTA_PROPRIA' ? 'Conta Própria' : 'Via Trade'}
                          </div>
                        </div>
                        
                        {diasAtraso > 0 && (
                          <div style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            ⚠️ {diasAtraso}d
                          </div>
                        )}
                      </div>

                      {/* Exportador */}
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: 'bold',
                          color: '#374151' 
                        }}>
                          {embarque.exportador.nomeEmpresa}
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#6b7280' 
                        }}>
                          {embarque.exportador.paisOrigem} • {embarque.armador}
                        </div>
                      </div>

                      {/* Unidade e ETA */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontSize: '11px',
                          background: '#f3f4f6',
                          color: '#374151',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {embarque.unidade === 'CEARA' ? 'CE' : 'SC'}
                        </span>
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#6b7280' 
                        }}>
                          ETA: {formatarData(embarque.dataETAPrevista)}
                        </span>
                      </div>

                      {/* Frete */}
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#059669',
                        textAlign: 'right'
                      }}>
                        {formatarMoeda(embarque.frete, embarque.moeda)}
                      </div>
                    </div>
                  )
                })}

                {embarquesNoStatus.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    padding: '20px'
                  }}>
                    Nenhum embarque neste status
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de Detalhes */}
      {selectedEmbarque && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
            borderRadius: '12px',
            maxWidth: '900px',
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
                  📦 Detalhes do Embarque - {selectedEmbarque.numeroReferencia}
                </h3>
                <button
                  onClick={() => setSelectedEmbarque(null)}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Fechar
                </button>
              </div>
              
              {/* Dados básicos do embarque */}
              <div style={{ 
                marginBottom: '30px',
                padding: '20px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 15px 0' }}>🚢 Informações Gerais</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '10px',
                  fontSize: '14px', 
                  lineHeight: '1.6' 
                }}>
                  <div><strong>Exportador:</strong> {selectedEmbarque.exportador.nomeEmpresa}</div>
                  <div><strong>País:</strong> {selectedEmbarque.exportador.paisOrigem}</div>
                  <div><strong>Armador:</strong> {selectedEmbarque.armador}</div>
                  <div><strong>Tipo:</strong> {selectedEmbarque.tipoImportacao === 'CONTA_PROPRIA' ? 'Conta Própria' : 'Via Trade'}</div>
                  <div><strong>Unidade:</strong> {selectedEmbarque.unidade === 'CEARA' ? 'Ceará' : 'Santa Catarina'}</div>
                  <div><strong>ETA:</strong> {formatarData(selectedEmbarque.dataETAPrevista)}</div>
                  <div><strong>Frete:</strong> {formatarMoeda(selectedEmbarque.frete, selectedEmbarque.moeda)}</div>
                  <div><strong>Status:</strong> {statusConfig[selectedEmbarque.status]?.label || selectedEmbarque.status}</div>
                </div>
                {selectedEmbarque.observacoes && (
                  <div style={{ marginTop: '15px' }}>
                    <strong>Observações:</strong> {selectedEmbarque.observacoes}
                  </div>
                )}
              </div>

              {/* Seção de Invoices */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '20px' 
                }}>
                  <h4 style={{ margin: 0 }}>📄 Invoices & Produtos</h4>
                  <button
                    onClick={() => setShowInvoiceForm(true)}
                    style={{
                      padding: '10px 20px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    + Nova Invoice
                  </button>
                </div>

                {loadingInvoices ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    Carregando invoices...
                  </div>
                ) : invoices.length === 0 ? (
                  <div style={{
                    padding: '30px',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.7)'
                  }}>
                    <p>Nenhuma invoice cadastrada para este embarque.</p>
                    <p style={{ fontSize: '12px' }}>Clique em "Nova Invoice" para adicionar produtos e containers.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {invoices.map((invoice, index) => (
                      <div key={invoice.id} style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '20px',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '15px'
                        }}>
                          <h5 style={{ margin: 0, fontSize: '16px' }}>
                            Invoice #{invoice.numero}
                          </h5>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: invoice.moeda
                            }).format(invoice.valorTotal)}
                          </div>
                        </div>

                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                          gap: '10px',
                          marginBottom: '15px',
                          fontSize: '13px'
                        }}>
                          <div><strong>Data:</strong> {formatarData(invoice.dataEmissao)}</div>
                          <div><strong>Exportador:</strong> {invoice.exportador.nomeEmpresa}</div>
                          <div><strong>Peso:</strong> {invoice.peso ? `${invoice.peso} kg` : '-'}</div>
                          <div><strong>Volumes:</strong> {invoice.volumes || '-'}</div>
                        </div>

                        {/* Containers da Invoice */}
                        {invoice.containers && invoice.containers.length > 0 && (
                          <div style={{ marginBottom: '15px' }}>
                            <h6 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>📦 Containers:</h6>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {invoice.containers.map((container: any) => (
                                <span key={container.id} style={{
                                  background: 'rgba(59, 130, 246, 0.8)',
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px'
                                }}>
                                  {container.numero} ({container.tipo} {container.tamanho})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Produtos da Invoice */}
                        {invoice.produtos && invoice.produtos.length > 0 && (
                          <div>
                            <h6 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>🏷️ Produtos ({invoice.produtos.length}):</h6>
                            <div style={{ 
                              maxHeight: '150px', 
                              overflowY: 'auto',
                              background: 'rgba(0,0,0,0.2)',
                              borderRadius: '6px',
                              padding: '10px'
                            }}>
                              {invoice.produtos.map((produto: any, prodIndex: number) => (
                                <div key={produto.id} style={{
                                  display: 'grid',
                                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                  gap: '10px',
                                  padding: '8px 0',
                                  borderBottom: prodIndex < invoice.produtos.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                  fontSize: '12px'
                                }}>
                                  <div>
                                    <strong>{produto.descricao}</strong>
                                    <br />
                                    <span style={{ opacity: 0.8 }}>NCM: {produto.ncm}</span>
                                  </div>
                                  <div>
                                    {produto.quantidade} {produto.unidadeMedida?.simbolo}
                                  </div>
                                  <div>
                                    {new Intl.NumberFormat('pt-BR', {
                                      style: 'currency',
                                      currency: invoice.moeda
                                    }).format(produto.valorUnitario)}
                                  </div>
                                  <div style={{ fontWeight: 'bold' }}>
                                    {new Intl.NumberFormat('pt-BR', {
                                      style: 'currency',
                                      currency: invoice.moeda
                                    }).format(produto.valorTotal)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal do Formulário de Invoice */}
      {showInvoiceForm && selectedEmbarque && (
        <InvoiceForm 
          embarqueId={selectedEmbarque.id}
          onClose={handleCloseInvoiceForm}
          onSave={handleSaveInvoice}
        />
      )}
    </div>
  )
}