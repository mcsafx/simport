import React, { useState, useEffect } from 'react'
import SaldoDetalhado from '../components/SaldoDetalhado'
import RetiradaForm from '../components/RetiradaForm'
import DAForm from '../components/DAForm'

interface EntrepostoAduaneiro {
  id: string
  embarqueId: string
  numeroReferencia: string
  tipoEntreposto: 'CLIA' | 'EADI'
  numeroDA: string
  dataRegistro: string
  prazoVencimento: string
  status: 'ATIVO' | 'VENCIDO' | 'FINALIZADO'
  exportador: {
    nomeEmpresa: string
    paisOrigem: string
  }
  saldoDisponivel: ItemSaldo[]
  totalRetiradas: number
  valorTotalMercadorias: number
  moeda: string
}

interface ItemSaldo {
  id: string
  invoiceId: string
  numeroInvoice: string
  codigoProduto: string
  descricaoProduto: string
  quantidadeOriginal: number
  quantidadeRetirada: number
  quantidadeDisponivel: number
  unidade: string
  pesoLiquidoOriginal: number
  pesoLiquidoRetirado: number
  pesoLiquidoDisponivel: number
  valorUnitario: number
  valorTotalDisponivel: number
  ncm: string
  lote: string
}

const statusColors: { [key: string]: string } = {
  'ATIVO': 'bg-green-500',
  'VENCIDO': 'bg-red-500',
  'FINALIZADO': 'bg-gray-500'
}

const statusLabels: { [key: string]: string } = {
  'ATIVO': 'Ativo',
  'VENCIDO': 'Vencido',
  'FINALIZADO': 'Finalizado'
}

export default function Entrepostos() {
  const [entrepostos, setEntrepostos] = useState<EntrepostoAduaneiro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedEntreposto, setSelectedEntreposto] = useState<EntrepostoAduaneiro | null>(null)
  const [showSaldoDetalhado, setShowSaldoDetalhado] = useState<{ id: string, numeroDA: string } | null>(null)
  const [showRetiradaForm, setShowRetiradaForm] = useState<string | null>(null)
  
  // Filtros
  const [filtros, setFiltros] = useState({
    tipoEntreposto: '',
    status: '',
    search: ''
  })

  useEffect(() => {
    carregarEntrepostos()
  }, [filtros])

  const carregarEntrepostos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`http://localhost:3001/api/entrepostos?${params}`)
      const data = await response.json()

      if (data.success) {
        setEntrepostos(data.data.data || [])
      } else {
        setError('Erro ao carregar entrepostos')
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

  const calcularDiasRestantes = (prazoVencimento: string) => {
    const hoje = new Date()
    const vencimento = new Date(prazoVencimento)
    const diffTime = vencimento.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (status: string, diasRestantes: number) => {
    if (status === 'VENCIDO') return 'bg-red-500'
    if (status === 'FINALIZADO') return 'bg-gray-500'
    if (diasRestantes <= 30) return 'bg-orange-500'
    if (diasRestantes <= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const handleSaveDA = async (formData: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/entrepostos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setShowForm(false)
        carregarEntrepostos()
      } else {
        setError(result.message || 'Erro ao criar D.A.')
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
        background: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
        minHeight: '100vh',
        color: 'white'
      }}>
        <h2>Carregando entrepostos...</h2>
      </div>
    )
  }

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
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
          🏢 Entrepostos Aduaneiros (CLIA/EADI)
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
          + Nova D.A.
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
              placeholder="N° DA, referência, exportador..."
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
              Tipo:
            </label>
            <select
              value={filtros.tipoEntreposto}
              onChange={(e) => setFiltros({ ...filtros, tipoEntreposto: e.target.value })}
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
              <option value="CLIA">CLIA</option>
              <option value="EADI">EADI</option>
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

      {/* Lista de Entrepostos */}
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

        {entrepostos.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h3>Nenhum entreposto encontrado</h3>
            <p>Cadastre uma nova D.A. (Declaração de Admissão) para começar.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>N° D.A.</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Referência</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Tipo</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Exportador</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Vencimento</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Valor Total</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {entrepostos.map((entreposto, index) => {
                  const diasRestantes = calcularDiasRestantes(entreposto.prazoVencimento)
                  return (
                    <tr 
                      key={entreposto.id}
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        background: index % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 'bold' }}>{entreposto.numeroDA}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                          {formatarData(entreposto.dataRegistro)}
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <strong>{entreposto.numeroReferencia}</strong>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: entreposto.tipoEntreposto === 'CLIA' ? 
                            'rgba(33, 150, 243, 0.3)' : 'rgba(76, 175, 80, 0.3)',
                          border: `1px solid ${entreposto.tipoEntreposto === 'CLIA' ? 
                            'rgba(33, 150, 243, 0.6)' : 'rgba(76, 175, 80, 0.6)'}`
                        }}>
                          {entreposto.tipoEntreposto}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 'bold' }}>{entreposto.exportador.nomeEmpresa}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>{entreposto.exportador.paisOrigem}</div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            background: getStatusColor(entreposto.status, diasRestantes),
                            color: 'white'
                          }}>
                            {statusLabels[entreposto.status]}
                          </span>
                        </div>
                        {entreposto.status === 'ATIVO' && (
                          <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                            {diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Vencido'}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 'bold' }}>
                          {formatarData(entreposto.prazoVencimento)}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.8 }}>
                          (180 dias)
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <strong>{formatarMoeda(entreposto.valorTotalMercadorias, entreposto.moeda)}</strong>
                        {entreposto.totalRetiradas > 0 && (
                          <div style={{ fontSize: '11px', opacity: 0.8 }}>
                            {entreposto.totalRetiradas} retiradas
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setShowSaldoDetalhado({ 
                              id: entreposto.id, 
                              numeroDA: entreposto.numeroDA 
                            })}
                            style={{
                              padding: '6px 10px',
                              background: 'rgba(33, 150, 243, 0.8)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            📦 Saldo
                          </button>
                          <button
                            onClick={() => setShowRetiradaForm(entreposto.id)}
                            style={{
                              padding: '6px 10px',
                              background: 'rgba(76, 175, 80, 0.8)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            📤 Retirar
                          </button>
                          <button
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
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Saldo Detalhado */}
      {showSaldoDetalhado && (
        <SaldoDetalhado
          entrepostoId={showSaldoDetalhado.id}
          numeroDA={showSaldoDetalhado.numeroDA}
          onClose={() => setShowSaldoDetalhado(null)}
          onRetirar={(entrepostoId) => {
            setShowSaldoDetalhado(null)
            setShowRetiradaForm(entrepostoId)
          }}
        />
      )}

      {/* Modal de Retirada */}
      {showRetiradaForm && (
        <RetiradaForm
          entrepostoId={showRetiradaForm}
          numeroDA={entrepostos.find(e => e.id === showRetiradaForm)?.numeroDA || ''}
          onClose={() => setShowRetiradaForm(null)}
          onSuccess={() => {
            carregarEntrepostos()
            setShowRetiradaForm(null)
          }}
        />
      )}

      {/* Formulário de D.A. */}
      {showForm && (
        <DAForm
          onSave={handleSaveDA}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}