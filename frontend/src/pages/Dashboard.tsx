import React, { useState, useEffect } from 'react'

interface DashboardMetrics {
  totalEmbarques: number
  embarquesAndamento: number
  embarquesAtrasados: number
  totalEntrepostos: number
  entrepostosVencendo: number
  valorTotalMercadorias: number
  moeda: string
  proximasAcoes: ProximaAcao[]
  statusOverview: { [key: string]: number }
}

interface ProximaAcao {
  id: string
  tipo: string
  titulo: string
  descricao: string
  prioridade: 'alta' | 'media' | 'baixa'
  prazo: string
  embarque: string
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    carregarMetricas()
  }, [])

  const carregarMetricas = async () => {
    try {
      setLoading(true)
      
      // Carregar todas as métricas em paralelo
      const [embarquesResponse, entrepostosResponse] = await Promise.all([
        fetch('http://localhost:3001/api/embarques'),
        fetch('http://localhost:3001/api/entrepostos')
      ])

      const [embarquesData, entrepostosData] = await Promise.all([
        embarquesResponse.json(),
        entrepostosResponse.json()
      ])

      if (embarquesData.success && entrepostosData.success) {
        const embarques = embarquesData.data.data
        const entrepostos = entrepostosData.data.data

        // Calcular métricas
        const hoje = new Date()
        
        const embarquesAtrasados = embarques.filter((e: any) => {
          const eta = new Date(e.dataETAPrevista)
          return eta < hoje && !['ENTREGUE', 'LIBERADO_CARREGAMENTO'].includes(e.status)
        }).length

        const entrepostosVencendo = entrepostos.filter((e: any) => {
          const vencimento = new Date(e.prazoVencimento)
          const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
          return e.status === 'ATIVO' && diasRestantes <= 30 && diasRestantes > 0
        }).length

        const valorTotal = entrepostos.reduce((total: number, e: any) => 
          total + (e.valorTotalMercadorias || 0), 0
        )

        // Status overview
        const statusOverview = embarques.reduce((acc: any, e: any) => {
          acc[e.status] = (acc[e.status] || 0) + 1
          return acc
        }, {})

        // Próximas ações (baseado nos dados reais)
        const proximasAcoes: ProximaAcao[] = []

        // Adicionar ações baseadas em embarques atrasados
        embarques.forEach((embarque: any) => {
          const eta = new Date(embarque.dataETAPrevista)
          const diasAtraso = Math.ceil((hoje.getTime() - eta.getTime()) / (1000 * 60 * 60 * 24))
          
          if (diasAtraso > 0 && !['ENTREGUE'].includes(embarque.status)) {
            proximasAcoes.push({
              id: `atraso-${embarque.id}`,
              tipo: 'atraso',
              titulo: `${embarque.numeroReferencia} - Atraso na ETA`,
              descricao: `Embarque com ${diasAtraso} dias de atraso na data prevista`,
              prioridade: diasAtraso > 7 ? 'alta' : 'media',
              prazo: `${diasAtraso} dias em atraso`,
              embarque: embarque.numeroReferencia
            })
          }
        })

        // Adicionar ações baseadas em entrepostos vencendo
        entrepostos.forEach((entreposto: any) => {
          const vencimento = new Date(entreposto.prazoVencimento)
          const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
          
          if (entreposto.status === 'ATIVO' && diasRestantes <= 60 && diasRestantes > 0) {
            proximasAcoes.push({
              id: `vencimento-${entreposto.id}`,
              tipo: 'vencimento',
              titulo: `${entreposto.numeroDA} - Vencimento D.A.`,
              descricao: `Entreposto vence em ${diasRestantes} dias`,
              prioridade: diasRestantes <= 30 ? 'alta' : 'media',
              prazo: `${diasRestantes} dias restantes`,
              embarque: entreposto.numeroReferencia
            })
          }
        })

        setMetrics({
          totalEmbarques: embarques.length,
          embarquesAndamento: embarques.filter((e: any) => !['ENTREGUE'].includes(e.status)).length,
          embarquesAtrasados,
          totalEntrepostos: entrepostos.length,
          entrepostosVencendo,
          valorTotalMercadorias: valorTotal,
          moeda: 'USD',
          proximasAcoes: proximasAcoes.slice(0, 5), // Limitar a 5 ações
          statusOverview
        })
      } else {
        setError('Erro ao carregar métricas')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const formatarMoeda = (valor: number, moeda: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: moeda
    }).format(valor)
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'rgba(244, 67, 54, 0.3)'
      case 'media': return 'rgba(255, 152, 0, 0.3)'
      case 'baixa': return 'rgba(33, 150, 243, 0.3)'
      default: return 'rgba(156, 163, 175, 0.3)'
    }
  }

  const statusLabels: { [key: string]: string } = {
    'PRE_EMBARQUE': 'Pré Embarque',
    'CARREGADO_BORDO': 'Carregado',
    'EM_TRANSITO': 'Em Trânsito',
    'CHEGADA_PORTO': 'No Porto',
    'PRESENCA_CARGA': 'Presença Carga',
    'REGISTRO_DI': 'Registro DI',
    'CANAL_PARAMETRIZADO': 'Canal Param.',
    'LIBERADO_CARREGAMENTO': 'Liberado',
    'AGENDAMENTO_RETIRADA': 'Agendamento',
    'ENTREGUE': 'Entregue'
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
        <h2>Carregando dashboard...</h2>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        color: 'white'
      }}>
        <h2>Erro ao carregar dashboard</h2>
        <p>{error}</p>
        <button
          onClick={carregarMetricas}
          style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
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
          📊 Dashboard - Visão Geral
        </h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', opacity: 0.8 }}>
            Atualizado: {new Date().toLocaleTimeString('pt-BR')}
          </span>
          <button
            onClick={carregarMetricas}
            style={{
              padding: '8px 16px',
              background: 'rgba(76, 175, 80, 0.8)',
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

      {/* Cards de Métricas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'rgba(33, 150, 243, 0.8)',
          padding: '25px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>🚢 Embarques</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {metrics.totalEmbarques}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {metrics.embarquesAndamento} em andamento
          </div>
          {metrics.embarquesAtrasados > 0 && (
            <div style={{ fontSize: '12px', color: '#ffcdd2', marginTop: '5px' }}>
              ⚠️ {metrics.embarquesAtrasados} com atraso
            </div>
          )}
        </div>

        <div style={{
          background: 'rgba(156, 39, 176, 0.8)',
          padding: '25px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>🏢 Entrepostos</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {metrics.totalEntrepostos}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            D.A.s ativas
          </div>
          {metrics.entrepostosVencendo > 0 && (
            <div style={{ fontSize: '12px', color: '#ffcdd2', marginTop: '5px' }}>
              ⏰ {metrics.entrepostosVencendo} vencendo em 30 dias
            </div>
          )}
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.8)',
          padding: '25px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>💰 Valor Total</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {formatarMoeda(metrics.valorTotalMercadorias, metrics.moeda)}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            Em entrepostos
          </div>
        </div>

        <div style={{
          background: 'rgba(245, 158, 11, 0.8)',
          padding: '25px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>⚠️ Alertas</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {metrics.proximasAcoes.filter(a => a.prioridade === 'alta').length}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            Ações urgentes
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
            {metrics.proximasAcoes.length} total
          </div>
        </div>
      </div>

      {/* Distribuição por Status */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '25px',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0' }}>📈 Distribuição por Status</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {Object.entries(metrics.statusOverview).map(([status, count]) => (
            <div key={status} style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '5px' }}>
                {count}
              </div>
              <div style={{ fontSize: '12px' }}>
                {statusLabels[status] || status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Próximas Ações */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '25px',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ margin: '0 0 20px 0' }}>🎯 Próximas Ações</h3>
        {metrics.proximasAcoes.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.7, padding: '20px' }}>
            ✅ Nenhuma ação pendente no momento
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {metrics.proximasAcoes.map((acao) => (
              <div key={acao.id} style={{
                padding: '15px',
                background: getPrioridadeColor(acao.prioridade),
                borderRadius: '8px',
                border: `1px solid ${acao.prioridade === 'alta' ? '#ef4444' : 
                  acao.prioridade === 'media' ? '#f59e0b' : '#3b82f6'}66`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {acao.titulo}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                      {acao.descricao}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      Embarque: {acao.embarque}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    background: acao.prioridade === 'alta' ? '#ef4444' : 
                      acao.prioridade === 'media' ? '#f59e0b' : '#3b82f6',
                    color: 'white',
                    marginLeft: '10px'
                  }}>
                    {acao.prazo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}