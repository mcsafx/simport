const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockEmbarques = [
  {
    id: '1',
    numeroReferencia: 'BIO-2024-001',
    tipoImportacao: 'CONTA_PROPRIA',
    unidade: 'CEARA',
    exportador: { nomeEmpresa: 'ChemCorp Industries' },
    armador: 'Maersk Line',
    status: 'EM_TRANSITO',
    dataETAPrevista: '2024-01-30',
    frete: 15000,
    moeda: 'USD'
  },
  {
    id: '2',
    numeroReferencia: 'BIO-2024-002',
    tipoImportacao: 'VIA_TRADE',
    unidade: 'SANTA_CATARINA',
    exportador: { nomeEmpresa: 'Global Supplies Ltd' },
    armador: 'MSC',
    status: 'CHEGADA_PORTO',
    dataETAPrevista: '2024-01-28',
    frete: 22000,
    moeda: 'USD'
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Biocol Import System API'
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'magnus@biocol.com.br' && password === 'demo123') {
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: 'mock-user-id',
          nome: 'Magnus Silva',
          email: 'magnus@biocol.com.br',
          role: 'coordenador'
        },
        token: 'mock-jwt-token'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciais inválidas'
    });
  }
});

// Embarques routes
app.get('/api/embarques', (req, res) => {
  res.json({
    success: true,
    message: 'Success',
    data: {
      data: mockEmbarques,
      pagination: {
        total: mockEmbarques.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  });
});

// Dashboard routes
app.get('/api/dashboard/metrics', (req, res) => {
  res.json({
    success: true,
    message: 'Success',
    data: {
      totalEmbarques: 24,
      embarquesEmAndamento: 18,
      embarquesComAtraso: 3,
      valorTotalImportacoes: 2400000
    }
  });
});

app.get('/api/dashboard/status-overview', (req, res) => {
  res.json({
    success: true,
    message: 'Success',
    data: [
      { status: 'PRE_EMBARQUE', count: 3 },
      { status: 'EM_TRANSITO', count: 8 },
      { status: 'CHEGADA_PORTO', count: 5 },
      { status: 'REGISTRO_DI', count: 4 },
      { status: 'ENTREGUE', count: 4 }
    ]
  });
});

app.get('/api/dashboard/proximas-acoes', (req, res) => {
  res.json({
    success: true,
    message: 'Success',
    data: [
      {
        id: '1',
        embarqueId: '1',
        numeroReferencia: 'BIO-2024-001',
        acao: 'Registrar DI',
        prazo: '2024-01-28',
        prioridade: 'alta',
        exportador: 'ChemCorp Industries'
      },
      {
        id: '2',
        embarqueId: '2',
        numeroReferencia: 'BIO-2024-002',
        acao: 'Agendar retirada',
        prazo: '2024-01-30',
        prioridade: 'media',
        exportador: 'Global Supplies Ltd'
      }
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});