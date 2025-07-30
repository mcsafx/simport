import React, { useState, useEffect } from 'react'

interface InvoiceItem {
  id: string
  invoiceId: string
  fatura: string
  product: string
  batch: string
  hsCode: string
  ncm: string
  unit: string
  netWeight: number
  grossWeight: number
  unitPrice: number
  quantity: number
  package: string
  packageQuantity: number
  packageGrossWeight: number
  iva: number
  totalValue: number
  pallets: number
  codErp: string
  refAglutina: string
  fab: string
  val: string
  loteAglutina: string
  manufacturer: string
  countryOfOrigin: string
  countryOfProvenance: string
  countryOfAcquisition: string
}

interface Invoice {
  id: string
  embarqueId: string
  numero: string
  tipo: 'COMMERCIAL_INVOICE' | 'PROFORMA'
  data: string
  moeda: string
  valorTotal: number
  observacoes: string
  itens: InvoiceItem[]
}

interface InvoiceManagerProps {
  embarqueId: string
  numeroReferencia: string
  onClose: () => void
}

export default function InvoiceManager({ embarqueId, numeroReferencia, onClose }: InvoiceManagerProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    carregarInvoices()
  }, [embarqueId])

  const carregarInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3001/api/embarques/${embarqueId}/invoices`)
      const data = await response.json()

      if (data.success) {
        setInvoices(data.data)
        if (data.data.length > 0) {
          setSelectedInvoice(data.data[0])
        }
      } else {
        setError('Erro ao carregar invoices')
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
      currency: moeda === 'USD' ? 'USD' : moeda === 'EUR' ? 'EUR' : 'BRL'
    }).format(valor)
  }

  const formatarPeso = (peso: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(peso) + ' kg'
  }

  if (loading) {
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
        color: 'white'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h2>Carregando invoices...</h2>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      zIndex: 1000,
      overflow: 'auto'
    }}>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px'
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
            📄 Invoices - {numeroReferencia}
          </h1>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ✕ Fechar
          </button>
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '20px',
          height: 'calc(100vh - 140px)'
        }}>
          {/* Lista de Invoices */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Invoices ({invoices.length})</h3>
            
            {invoices.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.7 }}>
                <p>Nenhuma invoice encontrada</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  style={{
                    padding: '10px 20px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  + Nova Invoice
                </button>
              </div>
            ) : (
              <>
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    onClick={() => setSelectedInvoice(invoice)}
                    style={{
                      padding: '15px',
                      marginBottom: '10px',
                      background: selectedInvoice?.id === invoice.id ? 
                        'rgba(33, 150, 243, 0.3)' : 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: selectedInvoice?.id === invoice.id ? 
                        '2px solid #2196F3' : '2px solid transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {invoice.numero}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      {invoice.tipo === 'COMMERCIAL_INVOICE' ? 'Commercial' : 'Proforma'}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                      {formatarMoeda(invoice.valorTotal, invoice.moeda)}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.6 }}>
                      {invoice.itens?.length || 0} itens
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => setShowAddForm(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginTop: '15px'
                  }}
                >
                  + Nova Invoice
                </button>
              </>
            )}
          </div>

          {/* Detalhes da Invoice Selecionada */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            overflow: 'auto'
          }}>
            {!selectedInvoice ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                opacity: 0.7
              }}>
                <p>Selecione uma invoice para ver os detalhes</p>
              </div>
            ) : (
              <>
                {/* Header da Invoice */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  padding: '15px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{selectedInvoice.numero}</h3>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>
                      {selectedInvoice.tipo} • {formatarMoeda(selectedInvoice.valorTotal, selectedInvoice.moeda)}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                      padding: '8px 16px',
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    + Adicionar Item
                  </button>
                </div>

                {/* Tabela de Itens */}
                <div style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  {!selectedInvoice.itens || selectedInvoice.itens.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', opacity: 0.7 }}>
                      <p>Nenhum item cadastrado nesta invoice</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                            <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px' }}>Produto</th>
                            <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px' }}>Lote</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px' }}>Peso Líq.</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px' }}>Qtd</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px' }}>Preço Unit.</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px' }}>Total</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInvoice.itens.map((item, index) => (
                            <tr 
                              key={item.id}
                              style={{ 
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                              }}
                            >
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.product}</div>
                                <div style={{ fontSize: '11px', opacity: 0.7 }}>{item.fatura}</div>
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '12px' }}>{item.batch}</td>
                              <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px' }}>
                                {formatarPeso(item.netWeight)}
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px' }}>
                                {item.quantity} {item.unit}
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px' }}>
                                {formatarMoeda(item.unitPrice, selectedInvoice.moeda)}
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px' }}>
                                <strong>{formatarMoeda(item.totalValue, selectedInvoice.moeda)}</strong>
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                <button
                                  onClick={() => setEditingItem(item)}
                                  style={{
                                    padding: '4px 8px',
                                    background: 'rgba(255, 152, 0, 0.8)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Editar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal de Edição de Item */}
        {editingItem && (
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
            zIndex: 1100
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              color: 'white'
            }}>
              <h3 style={{ marginTop: 0 }}>Editar Item - {editingItem.product}</h3>
              <p style={{ fontSize: '14px', opacity: 0.8 }}>
                Funcionalidade de edição será implementada na próxima etapa.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  onClick={() => setEditingItem(null)}
                  style={{
                    padding: '10px 20px',
                    background: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  style={{
                    padding: '10px 20px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Nova Invoice */}
        {showAddForm && (
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
            zIndex: 1100
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              color: 'white'
            }}>
              <h3 style={{ marginTop: 0 }}>Nova Invoice / Novo Item</h3>
              <p style={{ fontSize: '14px', opacity: 0.8 }}>
                Formulários de cadastro serão implementados na próxima etapa.
              </p>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginTop: '20px'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}