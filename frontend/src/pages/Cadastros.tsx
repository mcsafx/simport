import React, { useState } from 'react'

// Componentes dos cadastros individuais
const CadastroExportadores = () => {
  const [exportadores, setExportadores] = useState([])
  const [formulario, setFormulario] = useState({
    nomeEmpresa: '',
    pais: '',
    codigoERP: ''
  })

  const salvarExportador = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/exportadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      })
      if (response.ok) {
        setFormulario({
          nomeEmpresa: '',
          pais: '',
          codigoERP: ''
        })
        alert('Exportador salvo com sucesso!')
      }
    } catch (error) {
      alert('Erro ao salvar exportador')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>📋 Cadastro de Exportadores</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <input
          type="text"
          placeholder="Nome da Empresa"
          value={formulario.nomeEmpresa}
          onChange={(e) => setFormulario(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        
        <input
          type="text"
          placeholder="País"
          value={formulario.pais}
          onChange={(e) => setFormulario(prev => ({ ...prev, pais: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        <input
          type="text"
          placeholder="Código ERP (opcional)"
          value={formulario.codigoERP}
          onChange={(e) => setFormulario(prev => ({ ...prev, codigoERP: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>

      <button
        onClick={salvarExportador}
        style={{
          padding: '12px 24px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        💾 Salvar Exportador
      </button>
    </div>
  )
}

const CadastroArmadores = () => {
  const [formulario, setFormulario] = useState({
    nome: '',
    linkTracking: ''
  })

  const salvarArmador = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/armadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      })
      if (response.ok) {
        setFormulario({
          nome: '',
          linkTracking: ''
        })
        alert('Armador salvo com sucesso!')
      }
    } catch (error) {
      alert('Erro ao salvar armador')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>🚢 Cadastro de Armadores</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <input
          type="text"
          placeholder="Nome do Armador"
          value={formulario.nome}
          onChange={(e) => setFormulario(prev => ({ ...prev, nome: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        
        <input
          type="url"
          placeholder="Link da Página de Tracking (opcional)"
          value={formulario.linkTracking}
          onChange={(e) => setFormulario(prev => ({ ...prev, linkTracking: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>

      <button
        onClick={salvarArmador}
        style={{
          padding: '12px 24px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        💾 Salvar Armador
      </button>
    </div>
  )
}

const CadastroEntrepostos = () => {
  const [formulario, setFormulario] = useState({
    nome: '',
    cnpj: '',
    cidade: '',
    estado: '',
    cep: '',
    endereco: '',
    email: '',
    telefone: '',
    contato: '',
    observacoes: ''
  })

  const salvarEntreposto = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cadastros/empresas-entreposto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      })
      if (response.ok) {
        setFormulario({
          nome: '',
          cnpj: '',
          cidade: '',
          estado: '',
          cep: '',
          endereco: '',
          email: '',
          telefone: '',
          contato: '',
          observacoes: ''
        })
        alert('Empresa de entreposto salva com sucesso!')
      }
    } catch (error) {
      alert('Erro ao salvar empresa de entreposto')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>🏢 Cadastro de Empresas de Entrepostos</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <input
          type="text"
          placeholder="Nome da Empresa"
          value={formulario.nome}
          onChange={(e) => setFormulario(prev => ({ ...prev, nome: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        
        <input
          type="text"
          placeholder="CNPJ"
          value={formulario.cnpj}
          onChange={(e) => setFormulario(prev => ({ ...prev, cnpj: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        <input
          type="text"
          placeholder="Cidade"
          value={formulario.cidade}
          onChange={(e) => setFormulario(prev => ({ ...prev, cidade: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        <input
          type="text"
          placeholder="Estado"
          value={formulario.estado}
          onChange={(e) => setFormulario(prev => ({ ...prev, estado: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        <input
          type="text"
          placeholder="CEP"
          value={formulario.cep}
          onChange={(e) => setFormulario(prev => ({ ...prev, cep: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        <input
          type="text"
          placeholder="Endereço"
          value={formulario.endereco}
          onChange={(e) => setFormulario(prev => ({ ...prev, endereco: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        <input
          type="email"
          placeholder="Email"
          value={formulario.email}
          onChange={(e) => setFormulario(prev => ({ ...prev, email: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        <input
          type="text"
          placeholder="Telefone"
          value={formulario.telefone}
          onChange={(e) => setFormulario(prev => ({ ...prev, telefone: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        <input
          type="text"
          placeholder="Nome do Contato"
          value={formulario.contato}
          onChange={(e) => setFormulario(prev => ({ ...prev, contato: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>

      <textarea
        placeholder="Observações"
        value={formulario.observacoes}
        onChange={(e) => setFormulario(prev => ({ ...prev, observacoes: e.target.value }))}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          marginBottom: '20px',
          minHeight: '80px',
          resize: 'vertical'
        }}
      />

      <button
        onClick={salvarEntreposto}
        style={{
          padding: '12px 24px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        💾 Salvar Empresa de Entreposto
      </button>
    </div>
  )
}

const CadastroMoedas = () => {
  const [formulario, setFormulario] = useState({
    codigo: '',
    nome: '',
    simbolo: ''
  })

  const salvarMoeda = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/moedas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      })
      if (response.ok) {
        setFormulario({
          codigo: '',
          nome: '',
          simbolo: ''
        })
        alert('Moeda salva com sucesso!')
      }
    } catch (error) {
      alert('Erro ao salvar moeda')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>💰 Cadastro de Moedas</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <input
          type="text"
          placeholder="Código (ex: USD, EUR, BRL)"
          value={formulario.codigo}
          onChange={(e) => setFormulario(prev => ({ ...prev, codigo: e.target.value.toUpperCase() }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        
        <input
          type="text"
          placeholder="Nome (ex: Dólar Americano)"
          value={formulario.nome}
          onChange={(e) => setFormulario(prev => ({ ...prev, nome: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        <input
          type="text"
          placeholder="Símbolo (ex: $, €, R$)"
          value={formulario.simbolo}
          onChange={(e) => setFormulario(prev => ({ ...prev, simbolo: e.target.value }))}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>

      <button
        onClick={salvarMoeda}
        style={{
          padding: '12px 24px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        💾 Salvar Moeda
      </button>
    </div>
  )
}

export default function Cadastros() {
  const [abaSelecionada, setAbaSelecionada] = useState('exportadores')

  const abas = [
    { id: 'exportadores', label: '📋 Exportadores', componente: CadastroExportadores },
    { id: 'armadores', label: '🚢 Armadores', componente: CadastroArmadores },
    { id: 'entrepostos', label: '🏢 Entrepostos', componente: CadastroEntrepostos },
    { id: 'moedas', label: '💰 Moedas', componente: CadastroMoedas },
  ]

  const ComponenteAtivo = abas.find(aba => aba.id === abaSelecionada)?.componente || CadastroExportadores

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.8rem', 
          color: 'white',
          textAlign: 'center'
        }}>
          ⚙️ Sistema de Cadastros
        </h1>
        <p style={{ 
          margin: '10px 0 0 0', 
          fontSize: '14px', 
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center'
        }}>
          Gerencie todas as informações básicas do sistema
        </p>
      </div>

      {/* Navegação por abas */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '10px',
        marginBottom: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {abas.map(aba => (
            <button
              key={aba.id}
              onClick={() => setAbaSelecionada(aba.id)}
              style={{
                padding: '12px 20px',
                background: abaSelecionada === aba.id 
                  ? 'rgba(255,255,255,0.9)' 
                  : 'rgba(255,255,255,0.2)',
                color: abaSelecionada === aba.id ? '#1f2937' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da aba */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        minHeight: '400px'
      }}>
        <ComponenteAtivo />
      </div>
    </div>
  )
}