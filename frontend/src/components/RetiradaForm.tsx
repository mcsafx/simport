import React, { useState, useEffect } from 'react'

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

interface ItemRetirada {
  saldoId: string
  quantidade: number
  observacoes?: string
}

interface Props {
  entrepostoId: string
  numeroDA: string
  onClose: () => void
  onSuccess: () => void
}

export default function RetiradaForm({ entrepostoId, numeroDA, onClose, onSuccess }: Props) {
  const [saldos, setSaldos] = useState<ItemSaldo[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    numeroDF: '',
    observacoes: ''
  })
  
  const [itensRetirada, setItensRetirada] = useState<{ [key: string]: number }>({})
  const [observacoesItens, setObservacoesItens] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    carregarSaldo()
  }, [entrepostoId])

  const carregarSaldo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3001/api/entrepostos/${entrepostoId}/saldo`)
      const data = await response.json()

      if (data.success) {
        // Filtrar apenas itens com saldo disponível
        const saldosDisponiveis = data.data.filter((item: ItemSaldo) => item.quantidadeDisponivel > 0)
        setSaldos(saldosDisponiveis)
      } else {
        setError('Erro ao carregar saldo detalhado')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantidadeChange = (saldoId: string, quantidade: number) => {
    setItensRetirada(prev => ({
      ...prev,
      [saldoId]: quantidade
    }))
  }

  const handleObservacaoChange = (saldoId: string, observacao: string) => {
    setObservacoesItens(prev => ({
      ...prev,
      [saldoId]: observacao
    }))
  }

  const calcularTotais = () => {
    return saldos.reduce((totais, item) => {
      const quantidadeRetirada = itensRetirada[item.id] || 0
      const valorRetirado = quantidadeRetirada * item.valorUnitario
      const pesoRetirado = (quantidadeRetirada / item.quantidadeOriginal) * item.pesoLiquidoOriginal

      return {
        quantidade: totais.quantidade + quantidadeRetirada,
        peso: totais.peso + pesoRetirado,
        valor: totais.valor + valorRetirado,
        itens: totais.itens + (quantidadeRetirada > 0 ? 1 : 0)
      }
    }, { quantidade: 0, peso: 0, valor: 0, itens: 0 })
  }

  const validateForm = () => {
    const itensComRetirada = Object.values(itensRetirada).filter(qty => qty > 0)
    
    if (itensComRetirada.length === 0) {
      setError('Selecione pelo menos um item para retirada')
      return false
    }

    // Verificar se não excede quantidades disponíveis
    for (const item of saldos) {
      const quantidadeRetirada = itensRetirada[item.id] || 0
      if (quantidadeRetirada > item.quantidadeDisponivel) {
        setError(`Quantidade de ${item.codigoProduto} excede o disponível (${item.quantidadeDisponivel} ${item.unidade})`)
        return false
      }
    }

    if (!formData.numeroDF.trim()) {
      setError('Número da D.F. é obrigatório')
      return false
    }

    setError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    
    try {
      const itens: ItemRetirada[] = saldos
        .filter(item => itensRetirada[item.id] > 0)
        .map(item => ({
          saldoId: item.id,
          quantidade: itensRetirada[item.id],
          observacoes: observacoesItens[item.id] || ''
        }))

      const response = await fetch(`http://localhost:3001/api/entrepostos/${entrepostoId}/retiradas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numeroDF: formData.numeroDF,
          observacoes: formData.observacoes,
          itens
        })
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.message || 'Erro ao processar retirada')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setSubmitting(false)
    }
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(valor)
  }

  const formatarPeso = (peso: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(peso)
  }

  const totais = calcularTotais()

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
        borderRadius: '12px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: 'white'
      }}>
        <div style={{ padding: '30px' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '20px'
          }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>
                📤 Nova Retirada Parcial
              </h3>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>
                D.A. {numeroDA}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
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
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Carregando saldo disponível...</p>
            </div>
          ) : error ? (
            <div style={{
              background: 'rgba(244, 67, 54, 0.3)',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          ) : saldos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Nenhum item disponível para retirada.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Informações da Retirada */}
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 15px 0' }}>📋 Informações da Retirada</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: '15px'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Número D.F. *
                    </label>
                    <input
                      type="text"
                      value={formData.numeroDF}
                      onChange={(e) => setFormData(prev => ({ ...prev, numeroDF: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Ex: DF-2025-001"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Observações Gerais
                    </label>
                    <input
                      type="text"
                      value={formData.observacoes}
                      onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Observações sobre a retirada..."
                    />
                  </div>
                </div>
              </div>

              {/* Resumo da Retirada */}
              {totais.itens > 0 && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#10B981' }}>📊 Resumo da Retirada</h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    fontSize: '14px'
                  }}>
                    <div>
                      <strong>{totais.itens}</strong> itens selecionados
                    </div>
                    <div>
                      <strong>{formatarPeso(totais.peso)} kg</strong> peso total
                    </div>
                    <div>
                      <strong>{formatarMoeda(totais.valor)}</strong> valor total
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Itens */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  📦 Selecionar Itens para Retirada
                </div>
                
                {saldos.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '20px',
                      borderBottom: index < saldos.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                    }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr',
                      gap: '20px',
                      alignItems: 'start'
                    }}>
                      {/* Informações do Item */}
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                          {item.codigoProduto}
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '5px' }}>
                          {item.descricaoProduto}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.6 }}>
                          NCM: {item.ncm} • Lote: {item.lote} • Invoice: {item.numeroInvoice}
                        </div>
                        <div style={{ fontSize: '12px', marginTop: '5px' }}>
                          <span style={{ color: '#10B981', fontWeight: 'bold' }}>
                            Disponível: {item.quantidadeDisponivel.toLocaleString('pt-BR')} {item.unidade}
                          </span>
                          <span style={{ opacity: 0.7, marginLeft: '10px' }}>
                            ({formatarPeso(item.pesoLiquidoDisponivel)} kg)
                          </span>
                        </div>
                      </div>

                      {/* Quantidade a Retirar */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                          Quantidade a Retirar
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={item.quantidadeDisponivel}
                          step="0.01"
                          value={itensRetirada[item.id] || ''}
                          onChange={(e) => handleQuantidadeChange(item.id, parseFloat(e.target.value) || 0)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: 'none',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                          placeholder="0"
                        />
                        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                          {item.unidade} (máx: {item.quantidadeDisponivel.toLocaleString('pt-BR')})
                        </div>
                        
                        {itensRetirada[item.id] > 0 && (
                          <div style={{ marginTop: '8px', fontSize: '12px' }}>
                            <div style={{ color: '#F59E0B' }}>
                              Peso: {formatarPeso((itensRetirada[item.id] / item.quantidadeOriginal) * item.pesoLiquidoOriginal)} kg
                            </div>
                            <div style={{ color: '#10B981', fontWeight: 'bold' }}>
                              Valor: {formatarMoeda(itensRetirada[item.id] * item.valorUnitario)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Observações do Item */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                          Observações
                        </label>
                        <textarea
                          value={observacoesItens[item.id] || ''}
                          onChange={(e) => handleObservacaoChange(item.id, e.target.value)}
                          style={{
                            width: '100%',
                            height: '60px',
                            padding: '8px',
                            borderRadius: '4px',
                            border: 'none',
                            fontSize: '12px',
                            resize: 'vertical',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Observações específicas..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
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
                  disabled={submitting || totais.itens === 0}
                  style={{
                    padding: '12px 24px',
                    background: submitting || totais.itens === 0 ? '#666' : '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: submitting || totais.itens === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {submitting ? 'Processando...' : `Processar Retirada (${totais.itens} itens)`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}