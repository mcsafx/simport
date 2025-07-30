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

interface Props {
  entrepostoId: string
  numeroDA: string
  onClose: () => void
  onRetirar: (entrepostoId: string) => void
}

export default function SaldoDetalhado({ entrepostoId, numeroDA, onClose, onRetirar }: Props) {
  const [saldos, setSaldos] = useState<ItemSaldo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    carregarSaldo()
  }, [entrepostoId])

  const carregarSaldo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3001/api/entrepostos/${entrepostoId}/saldo`)
      const data = await response.json()

      if (data.success) {
        setSaldos(data.data)
      } else {
        setError('Erro ao carregar saldo detalhado')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
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

  const calcularPercentualRetirado = (original: number, retirado: number) => {
    if (original === 0) return 0
    return Math.round((retirado / original) * 100)
  }

  const totais = saldos.reduce((acc, item) => ({
    quantidadeOriginal: acc.quantidadeOriginal + item.quantidadeOriginal,
    quantidadeRetirada: acc.quantidadeRetirada + item.quantidadeRetirada,
    quantidadeDisponivel: acc.quantidadeDisponivel + item.quantidadeDisponivel,
    pesoOriginal: acc.pesoOriginal + item.pesoLiquidoOriginal,
    pesoRetirado: acc.pesoRetirado + item.pesoLiquidoRetirado,
    pesoDisponivel: acc.pesoDisponivel + item.pesoLiquidoDisponivel,
    valorDisponivel: acc.valorDisponivel + item.valorTotalDisponivel
  }), {
    quantidadeOriginal: 0,
    quantidadeRetirada: 0,
    quantidadeDisponivel: 0,
    pesoOriginal: 0,
    pesoRetirado: 0,
    pesoDisponivel: 0,
    valorDisponivel: 0
  })

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
        maxWidth: '1400px',
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
                📦 Saldo Detalhado por Item
              </h3>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>
                D.A. {numeroDA}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => onRetirar(entrepostoId)}
                style={{
                  padding: '10px 20px',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                📤 Nova Retirada
              </button>
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
                Fechar
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Carregando saldo detalhado...</p>
            </div>
          ) : error ? (
            <div style={{
              background: 'rgba(244, 67, 54, 0.3)',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          ) : saldos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Nenhum item encontrado no saldo.</p>
            </div>
          ) : (
            <>
              {/* Resumo Geral */}
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 15px 0' }}>📊 Resumo Geral</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>
                      {formatarPeso(totais.pesoDisponivel)} kg
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Peso Disponível</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3B82F6' }}>
                      {formatarMoeda(totais.valorDisponivel)}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Valor Disponível</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B' }}>
                      {saldos.length}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Itens Diferentes</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#EF4444' }}>
                      {calcularPercentualRetirado(totais.pesoOriginal, totais.pesoRetirado)}%
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Já Retirado</div>
                  </div>
                </div>
              </div>

              {/* Tabela de Itens */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>
                        Produto
                      </th>
                      <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        Quantidade
                      </th>
                      <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        Peso Líquido (kg)
                      </th>
                      <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        Valor Unit.
                      </th>
                      <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        Valor Total Disp.
                      </th>
                      <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {saldos.map((item, index) => {
                      const percentualRetirado = calcularPercentualRetirado(
                        item.quantidadeOriginal, 
                        item.quantidadeRetirada
                      )
                      
                      return (
                        <tr 
                          key={item.id}
                          style={{ 
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '15px' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                                {item.codigoProduto}
                              </div>
                              <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>
                                {item.descricaoProduto}
                              </div>
                              <div style={{ fontSize: '11px', opacity: 0.6 }}>
                                NCM: {item.ncm} • Lote: {item.lote}
                              </div>
                              <div style={{ fontSize: '11px', opacity: 0.6 }}>
                                Invoice: {item.numeroInvoice}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                              {item.quantidadeDisponivel.toLocaleString('pt-BR')} {item.unidade}
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>
                              de {item.quantidadeOriginal.toLocaleString('pt-BR')} {item.unidade}
                            </div>
                            {item.quantidadeRetirada > 0 && (
                              <div style={{ fontSize: '11px', color: '#F59E0B' }}>
                                Retirado: {item.quantidadeRetirada.toLocaleString('pt-BR')} {item.unidade}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                              {formatarPeso(item.pesoLiquidoDisponivel)}
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>
                              de {formatarPeso(item.pesoLiquidoOriginal)}
                            </div>
                            {item.pesoLiquidoRetirado > 0 && (
                              <div style={{ fontSize: '11px', color: '#F59E0B' }}>
                                Retirado: {formatarPeso(item.pesoLiquidoRetirado)}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                              {formatarMoeda(item.valorUnitario)}
                            </div>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10B981' }}>
                              {formatarMoeda(item.valorTotalDisponivel)}
                            </div>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              background: percentualRetirado === 0 ? '#10B981' : 
                                         percentualRetirado < 50 ? '#F59E0B' : '#EF4444',
                              color: 'white'
                            }}>
                              {percentualRetirado === 0 ? 'Íntegro' : 
                               percentualRetirado < 100 ? `${percentualRetirado}% retirado` : 'Esgotado'}
                            </div>
                            <div style={{ 
                              width: '60px', 
                              height: '4px', 
                              background: 'rgba(255,255,255,0.2)', 
                              borderRadius: '2px',
                              margin: '6px auto 0',
                              position: 'relative'
                            }}>
                              <div style={{
                                width: `${percentualRetirado}%`,
                                height: '100%',
                                background: percentualRetirado < 50 ? '#10B981' : 
                                           percentualRetirado < 80 ? '#F59E0B' : '#EF4444',
                                borderRadius: '2px',
                                transition: 'width 0.3s'
                              }} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}