import React, { useState, useEffect } from 'react'

interface Produto {
  id?: string
  descricao: string
  ncm: string
  quantidade: number
  unidadeMedidaId: string
  valorUnitario: number
  valorTotal: number
  peso?: number
}

interface Container {
  id?: string
  numero: string
  tipo: string
  tamanho: string
  peso?: number
}

interface InvoiceFormProps {
  embarqueId: string
  onClose: () => void
  onSave: () => void
}

export default function InvoiceForm({ embarqueId, onClose, onSave }: InvoiceFormProps) {
  const [invoice, setInvoice] = useState({
    numero: '',
    dataEmissao: '',
    valorTotal: 0,
    moeda: 'USD',
    peso: 0,
    volumes: 0,
    observacoes: '',
    exportadorId: ''
  })

  const [produtos, setProdutos] = useState<Produto[]>([{
    descricao: '',
    ncm: '',
    quantidade: 0,
    unidadeMedidaId: '',
    valorUnitario: 0,
    valorTotal: 0,
    peso: 0
  }])

  const [containers, setContainers] = useState<Container[]>([{
    numero: '',
    tipo: 'DRY',
    tamanho: '40HC',
    peso: 0
  }])

  const [exportadores, setExportadores] = useState([])
  const [unidadesMedida, setUnidadesMedida] = useState([])

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [exportadoresRes, unidadesRes] = await Promise.all([
        fetch('http://localhost:3001/api/cadastros/exportadores'),
        fetch('http://localhost:3001/api/cadastros/unidades-medida')
      ])

      const exportadoresData = await exportadoresRes.json()
      const unidadesData = await unidadesRes.json()

      if (exportadoresData.success) setExportadores(exportadoresData.data)
      if (unidadesData.success) setUnidadesMedida(unidadesData.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const calcularTotalProduto = (quantidade: number, valorUnitario: number) => {
    return quantidade * valorUnitario
  }

  const calcularValorTotalInvoice = () => {
    return produtos.reduce((total, produto) => total + produto.valorTotal, 0)
  }

  const adicionarProduto = () => {
    setProdutos([...produtos, {
      descricao: '',
      ncm: '',
      quantidade: 0,
      unidadeMedidaId: '',
      valorUnitario: 0,
      valorTotal: 0,
      peso: 0
    }])
  }

  const removerProduto = (index: number) => {
    if (produtos.length > 1) {
      setProdutos(produtos.filter((_, i) => i !== index))
    }
  }

  const atualizarProduto = (index: number, campo: string, valor: any) => {
    const novosProdutos = [...produtos]
    novosProdutos[index] = { ...novosProdutos[index], [campo]: valor }
    
    if (campo === 'quantidade' || campo === 'valorUnitario') {
      novosProdutos[index].valorTotal = calcularTotalProduto(
        novosProdutos[index].quantidade,
        novosProdutos[index].valorUnitario
      )
    }
    
    setProdutos(novosProdutos)
  }

  const adicionarContainer = () => {
    setContainers([...containers, {
      numero: '',
      tipo: 'DRY',
      tamanho: '40HC',
      peso: 0
    }])
  }

  const removerContainer = (index: number) => {
    if (containers.length > 1) {
      setContainers(containers.filter((_, i) => i !== index))
    }
  }

  const atualizarContainer = (index: number, campo: string, valor: any) => {
    const novosContainers = [...containers]
    novosContainers[index] = { ...novosContainers[index], [campo]: valor }
    setContainers(novosContainers)
  }

  const salvarInvoice = async () => {
    try {
      const invoiceCompleta = {
        ...invoice,
        valorTotal: calcularValorTotalInvoice(),
        embarqueId,
        produtos,
        containers
      }

      const response = await fetch('http://localhost:3001/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceCompleta)
      })

      if (response.ok) {
        alert('Invoice salva com sucesso!')
        onSave()
        onClose()
      } else {
        alert('Erro ao salvar invoice')
      }
    } catch (error) {
      console.error('Erro ao salvar invoice:', error)
      alert('Erro ao salvar invoice')
    }
  }

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
        background: 'white',
        borderRadius: '12px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: '#1f2937'
      }}>
        <div style={{ 
          padding: '30px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
              📄 Nova Invoice
            </h3>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Fechar
            </button>
          </div>
        </div>

        <div style={{ padding: '30px' }}>
          {/* Dados Gerais da Invoice */}
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ marginBottom: '20px', color: '#374151' }}>📋 Dados Gerais</h4>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Número da Invoice
                </label>
                <input
                  type="text"
                  value={invoice.numero}
                  onChange={(e) => setInvoice(prev => ({ ...prev, numero: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Data de Emissão
                </label>
                <input
                  type="date"
                  value={invoice.dataEmissao}
                  onChange={(e) => setInvoice(prev => ({ ...prev, dataEmissao: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Exportador
                </label>
                <select
                  value={invoice.exportadorId}
                  onChange={(e) => setInvoice(prev => ({ ...prev, exportadorId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Selecione um exportador</option>
                  {exportadores.map((exp: any) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.nomeEmpresa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Moeda
                </label>
                <select
                  value={invoice.moeda}
                  onChange={(e) => setInvoice(prev => ({ ...prev, moeda: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="BRL">BRL</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Peso Total (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={invoice.peso}
                  onChange={(e) => setInvoice(prev => ({ ...prev, peso: parseFloat(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Volumes
                </label>
                <input
                  type="number"
                  value={invoice.volumes}
                  onChange={(e) => setInvoice(prev => ({ ...prev, volumes: parseInt(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Observações
              </label>
              <textarea
                value={invoice.observacoes}
                onChange={(e) => setInvoice(prev => ({ ...prev, observacoes: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '80px'
                }}
              />
            </div>
          </div>

          {/* Containers */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, color: '#374151' }}>📦 Containers</h4>
              <button
                onClick={adicionarContainer}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Adicionar Container
              </button>
            </div>

            {containers.map((container, index) => (
              <div key={index} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                background: '#f9fafb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h5 style={{ margin: 0 }}>Container {index + 1}</h5>
                  {containers.length > 1 && (
                    <button
                      onClick={() => removerContainer(index)}
                      style={{
                        padding: '4px 8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remover
                    </button>
                  )}
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '10px'
                }}>
                  <input
                    type="text"
                    placeholder="Número do Container"
                    value={container.numero}
                    onChange={(e) => atualizarContainer(index, 'numero', e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  
                  <select
                    value={container.tipo}
                    onChange={(e) => atualizarContainer(index, 'tipo', e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="DRY">DRY</option>
                    <option value="REEFER">REEFER</option>
                    <option value="TANK">TANK</option>
                    <option value="FLAT RACK">FLAT RACK</option>
                  </select>
                  
                  <select
                    value={container.tamanho}
                    onChange={(e) => atualizarContainer(index, 'tamanho', e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="20">20'</option>
                    <option value="40">40'</option>
                    <option value="40HC">40' HC</option>
                    <option value="45">45'</option>
                  </select>
                  
                  <input
                    type="number"
                    placeholder="Peso (kg)"
                    step="0.01"
                    value={container.peso}
                    onChange={(e) => atualizarContainer(index, 'peso', parseFloat(e.target.value) || 0)}
                    style={{
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Produtos */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, color: '#374151' }}>🏷️ Produtos</h4>
              <button
                onClick={adicionarProduto}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Adicionar Produto
              </button>
            </div>

            {produtos.map((produto, index) => (
              <div key={index} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                background: '#f9fafb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h5 style={{ margin: 0 }}>Produto {index + 1}</h5>
                  {produtos.length > 1 && (
                    <button
                      onClick={() => removerProduto(index)}
                      style={{
                        padding: '4px 8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remover
                    </button>
                  )}
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <input
                    type="text"
                    placeholder="Descrição do Produto"
                    value={produto.descricao}
                    onChange={(e) => atualizarProduto(index, 'descricao', e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      gridColumn: 'span 2'
                    }}
                  />
                  
                  <input
                    type="text"
                    placeholder="NCM"
                    value={produto.ncm}
                    onChange={(e) => atualizarProduto(index, 'ncm', e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  
                  <input
                    type="number"
                    placeholder="Quantidade"
                    step="0.0001"
                    value={produto.quantidade}
                    onChange={(e) => atualizarProduto(index, 'quantidade', parseFloat(e.target.value) || 0)}
                    style={{
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  
                  <select
                    value={produto.unidadeMedidaId}
                    onChange={(e) => atualizarProduto(index, 'unidadeMedidaId', e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Unidade</option>
                    {unidadesMedida.map((unidade: any) => (
                      <option key={unidade.id} value={unidade.id}>
                        {unidade.simbolo} - {unidade.nome}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    placeholder="Valor Unitário"
                    step="0.0001"
                    value={produto.valorUnitario}
                    onChange={(e) => atualizarProduto(index, 'valorUnitario', parseFloat(e.target.value) || 0)}
                    style={{
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  
                  <input
                    type="number"
                    placeholder="Peso (kg)"
                    step="0.01"
                    value={produto.peso}
                    onChange={(e) => atualizarProduto(index, 'peso', parseFloat(e.target.value) || 0)}
                    style={{
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div style={{ 
                  textAlign: 'right',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#059669',
                  marginTop: '10px'
                }}>
                  Valor Total: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: invoice.moeda
                  }).format(produto.valorTotal)}
                </div>
              </div>
            ))}
          </div>

          {/* Resumo e Ações */}
          <div style={{
            borderTop: '2px solid #e5e7eb',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
              Valor Total da Invoice: {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: invoice.moeda
              }).format(calcularValorTotalInvoice())}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={salvarInvoice}
                style={{
                  padding: '12px 24px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                💾 Salvar Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}