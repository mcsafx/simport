import React, { useState, useEffect } from 'react'
import InvoiceManager from './InvoiceManager'
import EmbarqueForm from '../components/EmbarqueForm'

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

const statusColors: { [key: string]: string } = {
  'PRE_EMBARQUE': 'bg-gray-500',
  'CARREGADO_BORDO': 'bg-blue-500',
  'EM_TRANSITO': 'bg-yellow-500',
  'CHEGADA_PORTO': 'bg-orange-500',
  'PRESENCA_CARGA': 'bg-purple-500',
  'REGISTRO_DI': 'bg-indigo-500',
  'CANAL_PARAMETRIZADO': 'bg-pink-500',
  'LIBERADO_CARREGAMENTO': 'bg-green-500',
  'AGENDAMENTO_RETIRADA': 'bg-teal-500',
  'ENTREGUE': 'bg-emerald-500'
}

const statusLabels: { [key: string]: string } = {
  'PRE_EMBARQUE': 'Pré Embarque',
  'CARREGADO_BORDO': 'Carregado a Bordo',
  'EM_TRANSITO': 'Em Trânsito',
  'CHEGADA_PORTO': 'Chegada ao Porto',
  'PRESENCA_CARGA': 'Presença de Carga',
  'REGISTRO_DI': 'Registro DI',
  'CANAL_PARAMETRIZADO': 'Canal Parametrizado',
  'LIBERADO_CARREGAMENTO': 'Liberado p/ Carregamento',
  'AGENDAMENTO_RETIRADA': 'Agendamento de Retirada',
  'ENTREGUE': 'Entregue'
}

export default function Embarques() {
  const [embarques, setEmbarques] = useState<Embarque[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEmbarque, setEditingEmbarque] = useState<Embarque | null>(null)
  const [showInvoiceManager, setShowInvoiceManager] = useState<{ embarqueId: string, numeroReferencia: string } | null>(null)
  
  // Filtros
  const [filtros, setFiltros] = useState({
    unidade: '',
    status: '',
    tipoImportacao: '',
    search: ''
  })

  useEffect(() => {
    carregarEmbarques()
  }, [filtros])

  const carregarEmbarques = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`http://localhost:3001/api/embarques?${params}`)
      const data = await response.json()

      if (data.success) {
        setEmbarques(data.data.data)
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

  const handleSaveEmbarque = async (formData: any) => {
    try {
      const embarqueData = {
        ...formData,
        exportador: { id: formData.exportadorId },
        portoOrigem: {
          nome: formData.portoOrigemNome,
          codigo: formData.portoOrigemCodigo
        },
        portoDestino: {
          nome: formData.portoDestinoNome,
          codigo: formData.portoDestinoCodigo
        }
      }

      const url = editingEmbarque 
        ? `http://localhost:3001/api/embarques/${editingEmbarque.id}`
        : 'http://localhost:3001/api/embarques'
      
      const method = editingEmbarque ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(embarqueData)
      })

      const result = await response.json()

      if (result.success) {
        setShowForm(false)
        setEditingEmbarque(null)
        carregarEmbarques()
      } else {
        setError(result.message || 'Erro ao salvar embarque')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    }
  }

  const handleEditEmbarque = (embarque: Embarque) => {
    setEditingEmbarque(embarque)
    setShowForm(true)
  }

  const handleDeleteEmbarque = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este embarque?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/embarques/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        carregarEmbarques()
      } else {
        setError(result.message || 'Erro ao excluir embarque')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    }
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        color: 'white'
      }}>
        <h2>Carregando embarques...</h2>
      </div>
    )
  }

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          🚢 Gestão de Embarques
        </h1>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '12px 24px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          + Novo Embarque
        </button>
      </div>

      {/* Filtros */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Buscar:
            </label>
            <input
              type="text"
              value={filtros.search}
              onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
              placeholder="Referência, exportador, armador..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Unidade:
            </label>
            <select
              value={filtros.unidade}
              onChange={(e) => setFiltros({ ...filtros, unidade: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Todas</option>
              <option value="CEARA">Ceará</option>
              <option value="SANTA_CATARINA">Santa Catarina</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Tipo:
            </label>
            <select
              value={filtros.tipoImportacao}
              onChange={(e) => setFiltros({ ...filtros, tipoImportacao: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Todos</option>
              <option value="CONTA_PROPRIA">Conta Própria</option>
              <option value="VIA_TRADE">Via Trade</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Status:
            </label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Todos</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Embarques */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}>
        {error && (
          <div style={{
            background: 'rgba(244, 67, 54, 0.8)',
            color: 'white',
            padding: '15px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {embarques.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h3>Nenhum embarque encontrado</h3>
            <p>Ajuste os filtros ou cadastre um novo embarque.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Referência</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Exportador</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Unidade</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Tipo</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>ETA</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Frete</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {embarques.map((embarque, index) => (
                  <tr 
                    key={embarque.id}
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      background: index % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 'bold' }}>{embarque.numeroReferencia}</div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>{embarque.armador}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 'bold' }}>{embarque.exportador.nomeEmpresa}</div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>{embarque.exportador.paisOrigem}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      {embarque.unidade === 'CEARA' ? 'Ceará' : 'Santa Catarina'}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: embarque.tipoImportacao === 'CONTA_PROPRIA' ? 
                          'rgba(76, 175, 80, 0.3)' : 'rgba(33, 150, 243, 0.3)'
                      }}>
                        {embarque.tipoImportacao === 'CONTA_PROPRIA' ? 'Conta Própria' : 'Via Trade'}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: statusColors[embarque.status] || '#666',
                        color: 'white'
                      }}>
                        {statusLabels[embarque.status] || embarque.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      {formatarData(embarque.dataETAPrevista)}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <strong>{formatarMoeda(embarque.frete, embarque.moeda)}</strong>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setShowInvoiceManager({ 
                            embarqueId: embarque.id, 
                            numeroReferencia: embarque.numeroReferencia 
                          })}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(156, 39, 176, 0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          📄 Invoices
                        </button>
                        <button
                          onClick={() => handleEditEmbarque(embarque)}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(255, 152, 0, 0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteEmbarque(embarque.id)}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(244, 67, 54, 0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Manager */}
      {showInvoiceManager && (
        <InvoiceManager
          embarqueId={showInvoiceManager.embarqueId}
          numeroReferencia={showInvoiceManager.numeroReferencia}
          onClose={() => setShowInvoiceManager(null)}
        />
      )}

      {/* Formulário de Embarque */}
      {showForm && (
        <EmbarqueForm
          embarque={editingEmbarque}
          onSave={handleSaveEmbarque}
          onCancel={() => {
            setShowForm(false)
            setEditingEmbarque(null)
          }}
        />
      )}
    </div>
  )
}