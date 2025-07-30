import React from 'react'

function App() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '30px' }}>
        🚀 Sistema Biocol Import
      </h1>
      
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        background: 'rgba(255,255,255,0.1)',
        padding: '30px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2>✅ React está funcionando!</h2>
        <p><strong>Data/Hora:</strong> {new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Status:</strong> Aplicação carregada com sucesso!</p>
        
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(76, 175, 80, 0.3)', borderRadius: '8px' }}>
          <h3>🔐 Próximo passo: Login</h3>
          <p>Email: <code>magnus@biocol.com.br</code></p>
          <p>Senha: <code>demo123</code></p>
        </div>
        
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(33, 150, 243, 0.3)', borderRadius: '8px' }}>
          <h3>🔗 Links importantes:</h3>
          <ul>
            <li>Backend API: <a href="http://localhost:3001/health" style={{color: '#fff'}}>Health Check</a></li>
            <li>Teste: <a href="/teste.html" style={{color: '#fff'}}>Página de Teste</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App