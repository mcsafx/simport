const express = require('express');
const cors = require('cors');
const { 
  StatusEmbarque, 
  mockExportadores, 
  mockInvoices,
  mockContainers, 
  mockDocumentos, 
  mockEmbarques, 
  mockProximasAcoes,
  mockEntrepostos 
} = require('./mock-data');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Variável para simular dados persistentes durante a sessão
let embarques = [...mockEmbarques];
let proximasAcoes = [...mockProximasAcoes];
let invoices = [...mockInvoices];
let entrepostos = [...mockEntrepostos];

// Helper para gerar IDs únicos
const generateId = () => Date.now().toString();

// Helper para resposta padronizada
const response = (success, message, data = null) => ({
  success,
  message,
  data
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Biocol Import System API - CRUD Embarques'
  });
});

// ==================== AUTH ====================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'magnus@biocol.com.br' && password === 'demo123') {
    res.json(response(true, 'Login realizado com sucesso', {
      user: {
        id: 'mock-user-id',
        nome: 'Magnus Silva',
        email: 'magnus@biocol.com.br',
        role: 'coordenador'
      },
      token: 'mock-jwt-token'
    }));
  } else {
    res.status(401).json(response(false, 'Credenciais inválidas'));
  }
});

// ==================== EMBARQUES CRUD ====================

// GET /api/embarques - Listar embarques com filtros
app.get('/api/embarques', (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      unidade, 
      status, 
      tipoImportacao,
      search 
    } = req.query;

    let filteredEmbarques = [...embarques];

    // Aplicar filtros
    if (unidade) {
      filteredEmbarques = filteredEmbarques.filter(e => e.unidade === unidade);
    }

    if (status) {
      filteredEmbarques = filteredEmbarques.filter(e => e.status === status);
    }

    if (tipoImportacao) {
      filteredEmbarques = filteredEmbarques.filter(e => e.tipoImportacao === tipoImportacao);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredEmbarques = filteredEmbarques.filter(e => 
        e.numeroReferencia.toLowerCase().includes(searchLower) ||
        e.exportador.nomeEmpresa.toLowerCase().includes(searchLower) ||
        e.armador.toLowerCase().includes(searchLower)
      );
    }

    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedEmbarques = filteredEmbarques.slice(startIndex, endIndex);

    // Ordenar por data de criação (mais recente primeiro)
    paginatedEmbarques.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Incluir invoices nos embarques
    const embarquesComInvoices = paginatedEmbarques.map(embarque => ({
      ...embarque,
      invoices: invoices.filter(inv => inv.embarqueId === embarque.id)
    }));

    res.json(response(true, 'Success', {
      data: embarquesComInvoices,
      pagination: {
        total: filteredEmbarques.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(filteredEmbarques.length / limit)
      }
    }));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// GET /api/embarques/:id - Buscar embarque específico
app.get('/api/embarques/:id', (req, res) => {
  try {
    const { id } = req.params;
    const embarque = embarques.find(e => e.id === id);

    if (!embarque) {
      return res.status(404).json(response(false, 'Embarque não encontrado'));
    }

    // Incluir invoices no embarque
    const embarqueComInvoices = {
      ...embarque,
      invoices: invoices.filter(inv => inv.embarqueId === id)
    };

    res.json(response(true, 'Success', embarqueComInvoices));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// POST /api/embarques - Criar novo embarque  
app.post('/api/embarques', (req, res) => {
  try {
    const {
      numeroReferencia,
      tipoImportacao,
      unidade,
      exportadorId,
      armador,
      frete,
      moeda,
      portoOrigemId,
      portoDestinoId,
      dataEmbarquePrevista,
      dataETAPrevista,
      observacoes
    } = req.body;

    // Validações básicas
    if (!numeroReferencia || !tipoImportacao || !unidade || !exportadorId) {
      return res.status(400).json(response(false, 'Campos obrigatórios não preenchidos'));
    }

    // Verificar se número de referência já existe
    const existeReferencia = embarques.find(e => e.numeroReferencia === numeroReferencia);
    if (existeReferencia) {
      return res.status(400).json(response(false, 'Número de referência já existe'));
    }

    // Buscar exportador
    const exportador = mockExportadores.find(exp => exp.id === exportadorId);
    if (!exportador) {
      return res.status(400).json(response(false, 'Exportador não encontrado'));
    }

    // Criar novo embarque
    const novoEmbarque = {
      id: generateId(),
      numeroReferencia,
      tipoImportacao,
      unidade,
      exportador,
      armador: armador || '',
      frete: parseFloat(frete) || 0,
      moeda: moeda || 'USD',
      portoOrigemId: portoOrigemId || '',
      portoDestinoId: portoDestinoId || '',
      dataEmbarquePrevista: dataEmbarquePrevista || null,
      dataETAPrevista: dataETAPrevista || null,
      status: StatusEmbarque.PRE_EMBARQUE,
      containers: [],
      documentos: [],
      invoices: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      observacoes: observacoes || ''
    };

    embarques.push(novoEmbarque);
    
    res.status(201).json(response(true, 'Embarque criado com sucesso', novoEmbarque));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// PUT /api/embarques/:id - Atualizar embarque
app.put('/api/embarques/:id', (req, res) => {
  try {
    const { id } = req.params;
    const embarqueIndex = embarques.findIndex(e => e.id === id);

    if (embarqueIndex === -1) {
      return res.status(404).json(response(false, 'Embarque não encontrado'));
    }

    const {
      numeroReferencia,
      tipoImportacao,
      unidade,
      exportadorId,
      armador,
      frete,
      moeda,
      portoOrigemId,
      portoDestinoId,
      dataEmbarquePrevista,
      dataETAPrevista,
      status,
      observacoes
    } = req.body;

    // Verificar se novo número de referência já existe (exceto no próprio embarque)
    if (numeroReferencia) {
      const existeReferencia = embarques.find(e => 
        e.numeroReferencia === numeroReferencia && e.id !== id
      );
      if (existeReferencia) {
        return res.status(400).json(response(false, 'Número de referência já existe'));
      }
    }

    // Buscar exportador se fornecido
    let exportador = embarques[embarqueIndex].exportador;
    if (exportadorId) {
      const novoExportador = mockExportadores.find(exp => exp.id === exportadorId);
      if (!novoExportador) {
        return res.status(400).json(response(false, 'Exportador não encontrado'));
      }
      exportador = novoExportador;
    }

    // Atualizar campos fornecidos
    const embarqueAtualizado = {
      ...embarques[embarqueIndex],
      ...(numeroReferencia && { numeroReferencia }),
      ...(tipoImportacao && { tipoImportacao }),
      ...(unidade && { unidade }),
      ...(exportadorId && { exportador }),
      ...(armador !== undefined && { armador }),
      ...(frete !== undefined && { frete: parseFloat(frete) }),
      ...(moeda && { moeda }),
      ...(portoOrigemId !== undefined && { portoOrigemId }),
      ...(portoDestinoId !== undefined && { portoDestinoId }),
      ...(dataEmbarquePrevista !== undefined && { dataEmbarquePrevista }),
      ...(dataETAPrevista !== undefined && { dataETAPrevista }),
      ...(status && { status }),
      ...(observacoes !== undefined && { observacoes }),
      updatedAt: new Date().toISOString()
    };

    embarques[embarqueIndex] = embarqueAtualizado;

    // Incluir invoices no retorno
    const embarqueComInvoices = {
      ...embarqueAtualizado,
      invoices: invoices.filter(inv => inv.embarqueId === id)
    };

    res.json(response(true, 'Embarque atualizado com sucesso', embarqueComInvoices));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// DELETE /api/embarques/:id - Deletar embarque
app.delete('/api/embarques/:id', (req, res) => {
  try {
    const { id } = req.params;
    const embarqueIndex = embarques.findIndex(e => e.id === id);

    if (embarqueIndex === -1) {
      return res.status(404).json(response(false, 'Embarque não encontrado'));  
    }

    const embarqueRemovido = embarques[embarqueIndex];
    embarques.splice(embarqueIndex, 1);

    // Remover ações relacionadas
    proximasAcoes = proximasAcoes.filter(acao => acao.embarqueId !== id);

    res.json(response(true, 'Embarque removido com sucesso', embarqueRemovido));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// ==================== DASHBOARD ====================
app.get('/api/dashboard/metrics', (req, res) => {
  try {
    const totalEmbarques = embarques.length;
    const embarquesEmAndamento = embarques.filter(e => 
      ![StatusEmbarque.ENTREGUE, StatusEmbarque.PRE_EMBARQUE].includes(e.status)
    ).length;
    
    const agora = new Date();
    const embarquesComAtraso = embarques.filter(e => {
      if (!e.dataETAPrevista) return false;
      const eta = new Date(e.dataETAPrevista);
      return eta < agora && e.status !== StatusEmbarque.ENTREGUE;
    }).length;

    const valorTotalImportacoes = embarques.reduce((total, e) => total + e.frete, 0);

    res.json(response(true, 'Success', {
      totalEmbarques,
      embarquesEmAndamento,
      embarquesComAtraso,
      valorTotalImportacoes
    }));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

app.get('/api/dashboard/status-overview', (req, res) => {
  try {
    const statusCount = {};
    
    Object.values(StatusEmbarque).forEach(status => {
      statusCount[status] = embarques.filter(e => e.status === status).length;
    });

    const overview = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count
    }));

    res.json(response(true, 'Success', overview));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

app.get('/api/dashboard/proximas-acoes', (req, res) => {
  try {
    res.json(response(true, 'Success', proximasAcoes));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// ==================== EXPORTADORES ====================
app.get('/api/exportadores', (req, res) => {
  try {
    res.json(response(true, 'Success', mockExportadores));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// ==================== STATUS DISPONÍVEIS ====================
app.get('/api/status', (req, res) => {
  try {
    const statusList = Object.entries(StatusEmbarque).map(([key, value]) => ({
      key,
      value,
      label: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }));

    res.json(response(true, 'Success', statusList));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// ==================== INVOICES CRUD ====================

// GET /api/embarques/:id/invoices - Listar invoices de um embarque
app.get('/api/embarques/:id/invoices', (req, res) => {
  try {
    const { id } = req.params;
    const embarqueInvoices = invoices.filter(inv => inv.embarqueId === id);
    
    res.json(response(true, 'Success', embarqueInvoices));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// GET /api/invoices/:id - Buscar invoice específica
app.get('/api/invoices/:id', (req, res) => {
  try {
    const { id } = req.params;
    const invoice = invoices.find(inv => inv.id === id);

    if (!invoice) {
      return res.status(404).json(response(false, 'Invoice não encontrada'));
    }

    res.json(response(true, 'Success', invoice));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// POST /api/embarques/:id/invoices - Criar nova invoice para um embarque
app.post('/api/embarques/:id/invoices', (req, res) => {
  try {
    const { id: embarqueId } = req.params;
    const { numero, tipo, data, moeda, valorTotal, observacoes } = req.body;

    // Verificar se embarque existe
    const embarque = embarques.find(e => e.id === embarqueId);
    if (!embarque) {
      return res.status(404).json(response(false, 'Embarque não encontrado'));
    }

    // Validações básicas
    if (!numero || !tipo) {
      return res.status(400).json(response(false, 'Número e tipo são obrigatórios'));
    }

    // Verificar se número da invoice já existe para este embarque
    const existeNumero = invoices.find(inv => 
      inv.embarqueId === embarqueId && inv.numero === numero
    );
    if (existeNumero) {
      return res.status(400).json(response(false, 'Número de invoice já existe para este embarque'));
    }

    const novaInvoice = {
      id: generateId(),
      embarqueId,
      numero,
      tipo,
      data: data || new Date().toISOString(),
      moeda: moeda || 'USD',
      valorTotal: parseFloat(valorTotal) || 0,
      observacoes: observacoes || '',
      itens: []
    };

    invoices.push(novaInvoice);
    res.status(201).json(response(true, 'Invoice criada com sucesso', novaInvoice));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// PUT /api/invoices/:id - Atualizar invoice
app.put('/api/invoices/:id', (req, res) => {
  try {
    const { id } = req.params;
    const invoiceIndex = invoices.findIndex(inv => inv.id === id);

    if (invoiceIndex === -1) {
      return res.status(404).json(response(false, 'Invoice não encontrada'));
    }

    const { numero, tipo, data, moeda, valorTotal, observacoes } = req.body;
    const embarqueId = invoices[invoiceIndex].embarqueId;

    // Verificar se novo número já existe (exceto na própria invoice)
    if (numero) {
      const existeNumero = invoices.find(inv => 
        inv.embarqueId === embarqueId && inv.numero === numero && inv.id !== id
      );
      if (existeNumero) {
        return res.status(400).json(response(false, 'Número de invoice já existe para este embarque'));
      }
    }

    const invoiceAtualizada = {
      ...invoices[invoiceIndex],
      ...(numero && { numero }),
      ...(tipo && { tipo }),
      ...(data && { data }),
      ...(moeda && { moeda }),
      ...(valorTotal !== undefined && { valorTotal: parseFloat(valorTotal) }),
      ...(observacoes !== undefined && { observacoes })
    };

    invoices[invoiceIndex] = invoiceAtualizada;
    res.json(response(true, 'Invoice atualizada com sucesso', invoiceAtualizada));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// DELETE /api/invoices/:id - Deletar invoice
app.delete('/api/invoices/:id', (req, res) => {
  try {
    const { id } = req.params;
    const invoiceIndex = invoices.findIndex(inv => inv.id === id);

    if (invoiceIndex === -1) {
      return res.status(404).json(response(false, 'Invoice não encontrada'));
    }

    const invoiceRemovida = invoices[invoiceIndex];
    invoices.splice(invoiceIndex, 1);

    res.json(response(true, 'Invoice removida com sucesso', invoiceRemovida));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// ==================== INVOICE ITEMS CRUD ====================

// GET /api/invoices/:id/itens - Listar itens de uma invoice
app.get('/api/invoices/:id/itens', (req, res) => {
  try {
    const { id } = req.params;
    const invoice = invoices.find(inv => inv.id === id);
    
    if (!invoice) {
      return res.status(404).json(response(false, 'Invoice não encontrada'));
    }
    
    res.json(response(true, 'Success', invoice.itens || []));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// POST /api/invoices/:id/itens - Adicionar item à invoice
app.post('/api/invoices/:id/itens', (req, res) => {
  try {
    const { id: invoiceId } = req.params;
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    
    if (invoiceIndex === -1) {
      return res.status(404).json(response(false, 'Invoice não encontrada'));
    }

    const itemData = req.body;
    
    // Validações básicas
    if (!itemData.fatura || !itemData.product) {
      return res.status(400).json(response(false, 'Fatura e produto são obrigatórios'));
    }

    const novoItem = {
      id: generateId(),
      invoiceId,
      ...itemData,
      netWeight: parseFloat(itemData.netWeight) || 0,
      grossWeight: parseFloat(itemData.grossWeight) || 0,
      unitPrice: parseFloat(itemData.unitPrice) || 0,
      quantity: parseFloat(itemData.quantity) || 0,
      packageQuantity: parseFloat(itemData.packageQuantity) || 0,
      packageGrossWeight: parseFloat(itemData.packageGrossWeight) || 0,
      iva: parseFloat(itemData.iva) || 0,
      totalValue: parseFloat(itemData.totalValue) || 0,
      pallets: parseInt(itemData.pallets) || 0
    };

    if (!invoices[invoiceIndex].itens) {
      invoices[invoiceIndex].itens = [];
    }
    
    invoices[invoiceIndex].itens.push(novoItem);
    
    res.status(201).json(response(true, 'Item adicionado com sucesso', novoItem));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// PUT /api/invoices/:invoiceId/itens/:itemId - Atualizar item
app.put('/api/invoices/:invoiceId/itens/:itemId', (req, res) => {
  try {
    const { invoiceId, itemId } = req.params;
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    
    if (invoiceIndex === -1) {
      return res.status(404).json(response(false, 'Invoice não encontrada'));
    }

    const itemIndex = invoices[invoiceIndex].itens?.findIndex(item => item.id === itemId);
    if (itemIndex === -1 || itemIndex === undefined) {
      return res.status(404).json(response(false, 'Item não encontrado'));
    }

    const itemData = req.body;
    const itemAtualizado = {
      ...invoices[invoiceIndex].itens[itemIndex],
      ...itemData,
      netWeight: parseFloat(itemData.netWeight) || invoices[invoiceIndex].itens[itemIndex].netWeight,
      grossWeight: parseFloat(itemData.grossWeight) || invoices[invoiceIndex].itens[itemIndex].grossWeight,
      unitPrice: parseFloat(itemData.unitPrice) || invoices[invoiceIndex].itens[itemIndex].unitPrice,
      quantity: parseFloat(itemData.quantity) || invoices[invoiceIndex].itens[itemIndex].quantity,
      packageQuantity: parseFloat(itemData.packageQuantity) || invoices[invoiceIndex].itens[itemIndex].packageQuantity,
      packageGrossWeight: parseFloat(itemData.packageGrossWeight) || invoices[invoiceIndex].itens[itemIndex].packageGrossWeight,
      iva: parseFloat(itemData.iva) || invoices[invoiceIndex].itens[itemIndex].iva,
      totalValue: parseFloat(itemData.totalValue) || invoices[invoiceIndex].itens[itemIndex].totalValue,
      pallets: parseInt(itemData.pallets) || invoices[invoiceIndex].itens[itemIndex].pallets
    };

    invoices[invoiceIndex].itens[itemIndex] = itemAtualizado;
    
    res.json(response(true, 'Item atualizado com sucesso', itemAtualizado));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// DELETE /api/invoices/:invoiceId/itens/:itemId - Deletar item
app.delete('/api/invoices/:invoiceId/itens/:itemId', (req, res) => {
  try {
    const { invoiceId, itemId } = req.params;
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    
    if (invoiceIndex === -1) {
      return res.status(404).json(response(false, 'Invoice não encontrada'));
    }

    const itemIndex = invoices[invoiceIndex].itens?.findIndex(item => item.id === itemId);
    if (itemIndex === -1 || itemIndex === undefined) {
      return res.status(404).json(response(false, 'Item não encontrado'));
    }

    const itemRemovido = invoices[invoiceIndex].itens[itemIndex];
    invoices[invoiceIndex].itens.splice(itemIndex, 1);
    
    res.json(response(true, 'Item removido com sucesso', itemRemovido));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// ==================== ENTREPOSTOS ADUANEIROS ====================

// GET /api/entrepostos - Listar entrepostos com filtros
app.get('/api/entrepostos', (req, res) => {
  try {
    const { tipoEntreposto, status, search, page = 1, limit = 50 } = req.query;
    
    let filteredEntrepostos = [...entrepostos];
    
    // Aplicar filtros
    if (tipoEntreposto) {
      filteredEntrepostos = filteredEntrepostos.filter(e => 
        e.tipoEntreposto === tipoEntreposto
      );
    }
    
    if (status) {
      filteredEntrepostos = filteredEntrepostos.filter(e => 
        e.status === status
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEntrepostos = filteredEntrepostos.filter(e => 
        e.numeroDA.toLowerCase().includes(searchLower) ||
        e.numeroReferencia.toLowerCase().includes(searchLower) ||
        e.exportador.nomeEmpresa.toLowerCase().includes(searchLower)
      );
    }
    
    // Atualizar status baseado na data de vencimento
    const hoje = new Date();
    filteredEntrepostos = filteredEntrepostos.map(e => {
      const vencimento = new Date(e.prazoVencimento);
      if (e.status === 'ATIVO' && vencimento < hoje) {
        return { ...e, status: 'VENCIDO' };
      }
      return e;
    });
    
    // Paginação
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedEntrepostos = filteredEntrepostos.slice(startIndex, endIndex);
    
    const response_data = {
      data: paginatedEntrepostos,
      total: filteredEntrepostos.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredEntrepostos.length / parseInt(limit))
    };
    
    res.json(response(true, 'Success', response_data));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// GET /api/entrepostos/:id - Buscar entreposto específico
app.get('/api/entrepostos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const entreposto = entrepostos.find(e => e.id === id);

    if (!entreposto) {
      return res.status(404).json(response(false, 'Entreposto não encontrado'));
    }

    // Atualizar status baseado na data de vencimento
    const hoje = new Date();
    const vencimento = new Date(entreposto.prazoVencimento);
    if (entreposto.status === 'ATIVO' && vencimento < hoje) {
      entreposto.status = 'VENCIDO';
    }

    res.json(response(true, 'Success', entreposto));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// POST /api/entrepostos - Criar nova D.A.
app.post('/api/entrepostos', (req, res) => {
  try {
    const { 
      embarqueId, 
      tipoEntreposto, 
      numeroDA, 
      dataRegistro,
      observacoes 
    } = req.body;

    // Validações básicas
    if (!embarqueId || !tipoEntreposto || !numeroDA) {
      return res.status(400).json(response(false, 'Embarque, tipo e número da D.A. são obrigatórios'));
    }

    // Verificar se embarque existe
    const embarque = embarques.find(e => e.id === embarqueId);
    if (!embarque) {
      return res.status(404).json(response(false, 'Embarque não encontrado'));
    }

    // Verificar se número da D.A. já existe
    const existeNumeroDA = entrepostos.find(e => e.numeroDA === numeroDA);
    if (existeNumeroDA) {
      return res.status(400).json(response(false, 'Número da D.A. já existe'));
    }

    // Calcular prazo de vencimento (180 dias)
    const dataReg = dataRegistro ? new Date(dataRegistro) : new Date();
    const prazoVenc = new Date(dataReg);
    prazoVenc.setDate(prazoVenc.getDate() + 180);

    const novoEntreposto = {
      id: generateId(),
      embarqueId,
      numeroReferencia: embarque.numeroReferencia,
      tipoEntreposto,
      numeroDA,
      dataRegistro: dataReg.toISOString(),
      prazoVencimento: prazoVenc.toISOString(),
      status: 'ATIVO',
      exportador: {
        id: embarque.exportador.id,
        nomeEmpresa: embarque.exportador.nomeEmpresa,
        paisOrigem: embarque.exportador.paisOrigem
      },
      valorTotalMercadorias: embarque.frete, // Simplificação para mock
      moeda: embarque.moeda,
      totalRetiradas: 0,
      saldoDisponivel: [], // Será preenchido com base nas invoices
      observacoes: observacoes || ''
    };

    entrepostos.push(novoEntreposto);
    
    res.status(201).json(response(true, 'D.A. criada com sucesso', novoEntreposto));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// GET /api/entrepostos/:id/saldo - Obter saldo detalhado do entreposto
app.get('/api/entrepostos/:id/saldo', (req, res) => {
  try {
    const { id } = req.params;
    const entreposto = entrepostos.find(e => e.id === id);

    if (!entreposto) {
      return res.status(404).json(response(false, 'Entreposto não encontrado'));
    }

    res.json(response(true, 'Success', entreposto.saldoDisponivel));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// POST /api/entrepostos/:id/retiradas - Registrar retirada parcial
app.post('/api/entrepostos/:id/retiradas', (req, res) => {
  try {
    const { id } = req.params;
    const { itens, numeroDF, observacoes } = req.body;

    const entrepostoIndex = entrepostos.findIndex(e => e.id === id);
    if (entrepostoIndex === -1) {
      return res.status(404).json(response(false, 'Entreposto não encontrado'));
    }

    // Validações básicas
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json(response(false, 'Itens para retirada são obrigatórios'));
    }

    // Processar retirada
    const entreposto = entrepostos[entrepostoIndex];
    let retiradaValida = true;
    let mensagemErro = '';

    for (const itemRetirada of itens) {
      const saldoIndex = entreposto.saldoDisponivel.findIndex(s => s.id === itemRetirada.saldoId);
      
      if (saldoIndex === -1) {
        retiradaValida = false;
        mensagemErro = `Item de saldo ${itemRetirada.saldoId} não encontrado`;
        break;
      }

      const saldo = entreposto.saldoDisponivel[saldoIndex];
      
      if (itemRetirada.quantidade > saldo.quantidadeDisponivel) {
        retiradaValida = false;
        mensagemErro = `Quantidade solicitada (${itemRetirada.quantidade}) maior que disponível (${saldo.quantidadeDisponivel}) para item ${saldo.codigoProduto}`;
        break;
      }
    }

    if (!retiradaValida) {
      return res.status(400).json(response(false, mensagemErro));
    }

    // Processar retiradas
    for (const itemRetirada of itens) {
      const saldoIndex = entreposto.saldoDisponivel.findIndex(s => s.id === itemRetirada.saldoId);
      const saldo = entreposto.saldoDisponivel[saldoIndex];
      
      // Atualizar saldo
      saldo.quantidadeRetirada += itemRetirada.quantidade;
      saldo.quantidadeDisponivel -= itemRetirada.quantidade;
      
      const pesoRetirado = (itemRetirada.quantidade / saldo.quantidadeOriginal) * saldo.pesoLiquidoOriginal;
      saldo.pesoLiquidoRetirado += pesoRetirado;
      saldo.pesoLiquidoDisponivel -= pesoRetirado;
      
      const valorRetirado = itemRetirada.quantidade * saldo.valorUnitario;
      saldo.valorTotalDisponivel -= valorRetirado;
    }

    // Incrementar contador de retiradas
    entrepostos[entrepostoIndex].totalRetiradas += 1;

    // Verificar se entreposto foi totalmente retirado
    const totalDisponivel = entreposto.saldoDisponivel.reduce((total, saldo) => 
      total + saldo.quantidadeDisponivel, 0
    );
    
    if (totalDisponivel === 0) {
      entrepostos[entrepostoIndex].status = 'FINALIZADO';
    }

    const retirada = {
      id: generateId(),
      numeroDF: numeroDF || `DF-${Date.now()}`,
      dataRetirada: new Date().toISOString(),
      itens: itens,
      observacoes: observacoes || ''
    };
    
    res.json(response(true, 'Retirada registrada com sucesso', retirada));
  } catch (error) {
    res.status(500).json(response(false, 'Erro interno do servidor'));
  }
});

// ==================== FALLBACK ====================
app.use((req, res) => {
  res.status(404).json(response(false, 'Route not found'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🚢 Embarques CRUD ready with ${embarques.length} mock records`);
  console.log(`📄 Invoices CRUD ready with ${invoices.length} mock records`);
  console.log(`🏢 Entrepostos CRUD ready with ${entrepostos.length} mock records`);
  console.log(`📦 Total invoice items: ${invoices.reduce((total, inv) => total + (inv.itens?.length || 0), 0)} records`);
  console.log(`🔢 Total saldo items: ${entrepostos.reduce((total, ent) => total + (ent.saldoDisponivel?.length || 0), 0)} records`);
});