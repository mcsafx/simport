import React, { useState } from 'react'
import Embarques from './pages/Embarques'
import Entrepostos from './pages/Entrepostos'
import Kanban from './pages/Kanban'
import Cadastros from './pages/Cadastros'

interface User {
  nome: string
  email: string
  role: string
}

function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        onLogin(data.data.user)
      } else {
        setError('Credenciais inválidas')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%',
        background: 'rgba(255,255,255,0.1)',
        padding: '40px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '1.8rem', 
          marginBottom: '30px',
          color: 'white'
        }}>
          🚀 Sistema Biocol Import
        </h1>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                background: 'rgba(255,255,255,0.9)',
                boxSizing: 'border-box'
              }}
              placeholder="magnus@biocol.com.br"
              required
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontWeight: 'bold' }}>
              Senha:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                background: 'rgba(255,255,255,0.9)',
                boxSizing: 'border-box'
              }}
              placeholder="demo123"
              required
            />
          </div>
          
          {error && (
            <div style={{
              background: 'rgba(244, 67, 54, 0.8)',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#666' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: 'rgba(33, 150, 243, 0.3)', 
          borderRadius: '8px',
          color: 'white',
          fontSize: '14px'
        }}>
          <strong>Credenciais de teste:</strong><br/>
          Email: magnus@biocol.com.br<br/>
          Senha: demo123
        </div>
      </div>
    </div>
  )
}

function Dashboard({ user, onLogout, onNavigate }: { 
  user: User, 
  onLogout: () => void,
  onNavigate: (page: string) => void 
}) {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <header style={{
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
          🚀 Sistema Biocol Import
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span>Olá, <strong>{user.nome}</strong>!</span>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              background: 'rgba(244, 67, 54, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Menu de Navegação */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <button
          onClick={() => onNavigate('dashboard')}
          style={{
            padding: '10px 20px',
            background: 'rgba(76, 175, 80, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => onNavigate('embarques')}
          style={{
            padding: '10px 20px',
            background: 'rgba(33, 150, 243, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🚢 Embarques
        </button>
        <button
          onClick={() => onNavigate('entrepostos')}
          style={{
            padding: '10px 20px',
            background: 'rgba(156, 39, 176, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🏢 Entrepostos
        </button>
        <button
          onClick={() => onNavigate('kanban')}
          style={{
            padding: '10px 20px',
            background: 'rgba(30, 58, 138, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          📋 Kanban
        </button>
        <button
          onClick={() => onNavigate('cadastros')}
          style={{
            padding: '10px 20px',
            background: 'rgba(168, 85, 247, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ⚙️ Cadastros
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'rgba(76, 175, 80, 0.8)',
          padding: '30px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem' }}>📊 Dashboard</h3>
          <p>Visão geral dos embarques e métricas importantes do sistema.</p>
          <div style={{ marginTop: '15px', fontSize: '2rem', fontWeight: 'bold' }}>24</div>
          <div>Total de Embarques</div>
        </div>

        <div style={{
          background: 'rgba(33, 150, 243, 0.8)',
          padding: '30px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem' }}>🚢 Embarques</h3>
          <p>Gestão completa de embarques e containers.</p>
          <div style={{ marginTop: '15px', fontSize: '2rem', fontWeight: 'bold' }}>18</div>
          <div>Em Andamento</div>
        </div>

        <div style={{
          background: 'rgba(255, 152, 0, 0.8)',
          padding: '30px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem' }}>⚠️ Alertas</h3>
          <p>Embarques com prazos próximos ao vencimento.</p>
          <div style={{ marginTop: '15px', fontSize: '2rem', fontWeight: 'bold' }}>3</div>
          <div>Requerem Atenção</div>
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '30px',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ margin: '0 0 20px 0' }}>🎯 Próximas Ações</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '15px', background: 'rgba(244, 67, 54, 0.3)', borderRadius: '8px' }}>
            <strong>BIO-2025-001</strong> - Confirmar chegada ao porto
          </div>
          <div style={{ padding: '15px', background: 'rgba(255, 152, 0, 0.3)', borderRadius: '8px' }}>
            <strong>BIO-2025-004</strong> - Presença de carga vence em 2 dias
          </div>
          <div style={{ padding: '15px', background: 'rgba(33, 150, 243, 0.3)', borderRadius: '8px' }}>
            <strong>BIO-2025-005</strong> - Agendar retirada com transportadora
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState('dashboard')

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage('dashboard')
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  const renderPageWithNavigation = (PageComponent: React.ComponentType) => {
    return (
      <div>
        {/* Header fixo para navegação */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          padding: '10px 20px',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => handleNavigate('dashboard')}
              style={{
                padding: '8px 16px',
                background: 'rgba(76, 175, 80, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => handleNavigate('embarques')}
              style={{
                padding: '8px 16px',
                background: 'rgba(33, 150, 243, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🚢 Embarques
            </button>
            <button
              onClick={() => handleNavigate('entrepostos')}
              style={{
                padding: '8px 16px',
                background: 'rgba(156, 39, 176, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🏢 Entrepostos
            </button>
            <button
              onClick={() => handleNavigate('kanban')}
              style={{
                padding: '8px 16px',
                background: 'rgba(30, 58, 138, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              📋 Kanban
            </button>
            <button
              onClick={() => handleNavigate('cadastros')}
              style={{
                padding: '8px 16px',
                background: 'rgba(168, 85, 247, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ⚙️ Cadastros
            </button>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: 'rgba(244, 67, 54, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>
        
        {/* Conteúdo com margem para header fixo */}
        <div style={{ paddingTop: '70px' }}>
          <PageComponent />
        </div>
      </div>
    )
  }

  if (currentPage === 'embarques') {
    return renderPageWithNavigation(Embarques)
  }

  if (currentPage === 'entrepostos') {
    return renderPageWithNavigation(Entrepostos)
  }

  if (currentPage === 'kanban') {
    return renderPageWithNavigation(Kanban)
  }

  if (currentPage === 'cadastros') {
    return renderPageWithNavigation(Cadastros)
  }

  return <Dashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
}

export default App