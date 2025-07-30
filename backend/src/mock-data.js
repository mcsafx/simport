// Status do embarque conforme PRD
const StatusEmbarque = {
  PRE_EMBARQUE: 'PRE_EMBARQUE',
  CARREGADO_BORDO: 'CARREGADO_BORDO', 
  EM_TRANSITO: 'EM_TRANSITO',
  CHEGADA_PORTO: 'CHEGADA_PORTO',
  PRESENCA_CARGA: 'PRESENCA_CARGA',
  REGISTRO_DI: 'REGISTRO_DI',
  CANAL_PARAMETRIZADO: 'CANAL_PARAMETRIZADO',
  LIBERADO_CARREGAMENTO: 'LIBERADO_CARREGAMENTO',
  AGENDAMENTO_RETIRADA: 'AGENDAMENTO_RETIRADA',
  ENTREGUE: 'ENTREGUE'
}

// Mock exportadores
const mockExportadores = [
  {
    id: 'exp1',
    nomeEmpresa: 'ChemCorp Industries Ltd',
    endereco: {
      rua: '123 Industrial District',
      cidade: 'Shanghai',
      estado: 'Shanghai',
      cep: '200000',
      pais: 'China'
    },
    contatos: [
      {
        id: 'cont1',
        nome: 'Li Wei',
        email: 'li.wei@chemcorp.com',
        telefone: '+86 21 1234-5678',
        cargo: 'Export Manager'
      }
    ],
    paisOrigem: 'China',
    produtos: ['Produtos químicos', 'Materiais industriais'],
    observacoes: 'Fornecedor principal de químicos'
  },
  {
    id: 'exp2', 
    nomeEmpresa: 'Global Supplies Ltd',
    endereco: {
      rua: '456 Trade Avenue',
      cidade: 'Hong Kong',
      estado: 'Hong Kong',
      cep: '000000',
      pais: 'Hong Kong'
    },
    contatos: [
      {
        id: 'cont2',
        nome: 'John Smith',
        email: 'j.smith@globalsupplies.com',
        telefone: '+852 2345-6789',
        cargo: 'Sales Director'
      }
    ],
    paisOrigem: 'Hong Kong',
    produtos: ['Equipamentos', 'Peças de reposição'],
    observacoes: 'Fornecedor de equipamentos industriais'
  },
  {
    id: 'exp3',
    nomeEmpresa: 'European Trading Co',
    endereco: {
      rua: '789 Commerce Street',
      cidade: 'Hamburg',
      estado: 'Hamburg',
      cep: '20095',
      pais: 'Germany'
    },
    contatos: [
      {
        id: 'cont3',
        nome: 'Klaus Mueller',
        email: 'k.mueller@eurotrading.de',
        telefone: '+49 40 1234-567',
        cargo: 'Export Coordinator'
      }
    ],
    paisOrigem: 'Germany',
    produtos: ['Maquinário', 'Tecnologia'],
    observacoes: 'Especialista em maquinário europeu'
  }
]

// Mock invoices com itens detalhados
const mockInvoices = [
  {
    id: 'inv1',
    embarqueId: '1',
    numero: 'SHYD9241115726',
    tipo: 'COMMERCIAL_INVOICE', // ou 'PROFORMA'
    data: '2025-01-18T00:00:00Z',
    moeda: 'USD',
    valorTotal: 81688.80,
    observacoes: 'Invoice principal - produtos químicos',
    itens: [
      {
        id: 'item1',
        invoiceId: 'inv1',
        fatura: 'FA.250549',
        product: 'POLYETHER POLYOL YD-8238',
        batch: '24120712',
        hsCode: '3907.29.39',
        ncm: '39072939',
        unit: 'KG',
        netWeight: 11760.00,
        grossWeight: 12759.30,
        unitPrice: 1.458000,
        quantity: 56.00,
        package: 'DRUMS',
        packageQuantity: 210.00,
        packageGrossWeight: 227.84,
        iva: 0.00,
        totalValue: 17146.08,
        pallets: 4,
        codErp: 'ERP001238',
        refAglutina: 'AGL001',
        fab: '2024-12',
        val: '2026-12',
        loteAglutina: 'LA240712',
        manufacturer: 'ChemCorp Industries Ltd',
        countryOfOrigin: 'China',
        countryOfProvenance: 'China',
        countryOfAcquisition: 'China'
      },
      {
        id: 'item2',
        invoiceId: 'inv1',
        fatura: 'FA.250550',
        product: 'CATALYST BLEND CT-405',
        batch: '24120713',
        hsCode: '3815.19.90',
        ncm: '38151990',
        unit: 'KG',
        netWeight: 5800.00,
        grossWeight: 6120.00,
        unitPrice: 2.850000,
        quantity: 25.00,
        package: 'BAGS',
        packageQuantity: 145.00,
        packageGrossWeight: 152.30,
        iva: 0.00,
        totalValue: 16530.00,
        pallets: 2,
        codErp: 'ERP001239',
        refAglutina: 'AGL002',
        fab: '2024-12',
        val: '2025-12',
        loteAglutina: 'LA240713',
        manufacturer: 'ChemCorp Industries Ltd',
        countryOfOrigin: 'China',
        countryOfProvenance: 'China',
        countryOfAcquisition: 'China'
      }
    ]
  },
  {
    id: 'inv2',
    embarqueId: '2',
    numero: 'GSL2024001156',
    tipo: 'COMMERCIAL_INVOICE',
    data: '2025-01-22T00:00:00Z',
    moeda: 'USD',
    valorTotal: 45280.00,
    observacoes: 'Equipamentos industriais',
    itens: [
      {
        id: 'item3',
        invoiceId: 'inv2',
        fatura: 'GSL001',
        product: 'INDUSTRIAL PUMP MODEL P-350',
        batch: 'P350-2024-Q4',
        hsCode: '8413.70.90',
        ncm: '84137090',
        unit: 'UN',
        netWeight: 850.00,
        grossWeight: 920.00,
        unitPrice: 15600.00,
        quantity: 2.00,
        package: 'WOODEN CRATE',
        packageQuantity: 2.00,
        packageGrossWeight: 1840.00,
        iva: 0.00,
        totalValue: 31200.00,
        pallets: 1,
        codErp: 'ERP002001',
        refAglutina: 'EQP001',
        fab: '2024-11',
        val: '2030-11',
        loteAglutina: 'EQ241122',
        manufacturer: 'Global Supplies Ltd',
        countryOfOrigin: 'Hong Kong',
        countryOfProvenance: 'Hong Kong',
        countryOfAcquisition: 'Hong Kong'
      },
      {
        id: 'item4',
        invoiceId: 'inv2',
        fatura: 'GSL002',
        product: 'SPARE PARTS KIT P-350',
        batch: 'SP350-2024-Q4',
        hsCode: '8413.91.90',
        ncm: '84139190',
        unit: 'SET',
        netWeight: 125.00,
        grossWeight: 145.00,
        unitPrice: 1408.00,
        quantity: 10.00,
        package: 'CARDBOARD BOX',
        packageQuantity: 5.00,
        packageGrossWeight: 725.00,
        iva: 0.00,
        totalValue: 14080.00,
        pallets: 0,
        codErp: 'ERP002002',
        refAglutina: 'EQP002',
        fab: '2024-11',
        val: '2029-11',
        loteAglutina: 'SP241122',
        manufacturer: 'Global Supplies Ltd',
        countryOfOrigin: 'Hong Kong',
        countryOfProvenance: 'Hong Kong',
        countryOfAcquisition: 'Hong Kong'
      }
    ]
  }
]

// Mock containers
const mockContainers = [
  {
    id: 'cont1',
    numero: 'MSCU1234567',
    tipo: 'Dry Container',
    tamanho: '40HC',
    peso: 28500,
    embarqueId: '1'
  },
  {
    id: 'cont2',
    numero: 'MSCU7654321',
    tipo: 'Dry Container', 
    tamanho: '20GP',
    peso: 18200,
    embarqueId: '1'
  },
  {
    id: 'cont3',
    numero: 'MAEU9876543',
    tipo: 'Reefer Container',
    tamanho: '40HC',
    peso: 26800,
    embarqueId: '2'
  }
]

// Mock documentos
const mockDocumentos = [
  {
    id: 'doc1',
    nome: 'Bill of Lading',
    tipo: 'BL',
    url: '/docs/bl_bio2024001.pdf',
    uploadedAt: '2024-01-15T10:30:00Z',
    embarqueId: '1'
  },
  {
    id: 'doc2',
    nome: 'Commercial Invoice',
    tipo: 'INVOICE',
    url: '/docs/invoice_bio2024001.pdf', 
    uploadedAt: '2024-01-15T10:35:00Z',
    embarqueId: '1'
  },
  {
    id: 'doc3',
    nome: 'Packing List',
    tipo: 'PACKING',
    url: '/docs/packing_bio2024001.pdf',
    uploadedAt: '2024-01-15T10:40:00Z',
    embarqueId: '1'
  }
]

// Mock embarques completos
const mockEmbarques = [
  {
    id: '1',
    numeroReferencia: 'BIO-2025-001',
    referenciaInterna: 'BIO-2025-001',
    referenciaExterna: 'MAEU1234567890', // BL/HBL/AWB
    tipoImportacao: 'CONTA_PROPRIA',
    unidade: 'CEARA',
    exportador: mockExportadores[0],
    armador: 'Maersk Line',
    frete: 81688.80, // Calculado baseado nas invoices
    moeda: 'USD',
    portoOrigemId: 'CNSHA', // Shanghai
    portoDestinoId: 'BRFOR', // Fortaleza
    dataEmbarquePrevista: '2025-01-20T00:00:00Z',
    dataETAPrevista: '2025-02-15T00:00:00Z',
    status: StatusEmbarque.EM_TRANSITO,
    containers: mockContainers.filter(c => c.embarqueId === '1'),
    documentos: mockDocumentos.filter(d => d.embarqueId === '1'),
    invoices: mockInvoices.filter(inv => inv.embarqueId === '1'),
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    observacoes: 'Embarque prioritário - produtos químicos para expansão CE',
    // Dados gerais da carga
    shipper: mockExportadores[0].nomeEmpresa,
    pdcErp: 'PDC001-2025',
    pol: 'Shanghai (CNSHA)',
    pod: 'Fortaleza (BRFOR)',
    modalFrete: 'MARITIMO',
    tipoFrete: 'CIF',
    blHblAwb: 'MAEU1234567890',
    moedaPredominante: 'USD - DÓLAR DOS EUA'
  },
  {
    id: '2', 
    numeroReferencia: 'BIO-2025-002',
    referenciaInterna: 'BIO-2025-002',
    referenciaExterna: 'MSC9876543210',
    tipoImportacao: 'VIA_TRADE',
    unidade: 'SANTA_CATARINA',
    exportador: mockExportadores[1],
    armador: 'MSC',
    frete: 45280.00, // Calculado baseado nas invoices
    moeda: 'USD',
    portoOrigemId: 'HKHKG', // Hong Kong
    portoDestinoId: 'BRIGN', // Itajaí/Navegantes
    dataEmbarquePrevista: '2025-01-25T00:00:00Z',
    dataETAPrevista: '2025-02-20T00:00:00Z',
    status: StatusEmbarque.CHEGADA_PORTO,
    containers: mockContainers.filter(c => c.embarqueId === '2'),
    documentos: [],
    invoices: mockInvoices.filter(inv => inv.embarqueId === '2'),
    createdAt: '2025-01-12T09:15:00Z',
    updatedAt: '2025-01-28T16:45:00Z',
    observacoes: 'Equipamentos para modernização da unidade SC',
    // Dados gerais da carga
    shipper: mockExportadores[1].nomeEmpresa,
    pdcErp: 'PDC002-2025',
    pol: 'Hong Kong (HKHKG)',
    pod: 'Itajaí/Navegantes (BRIGN)',
    modalFrete: 'MARITIMO',
    tipoFrete: 'FOB',
    blHblAwb: 'MSC9876543210',
    moedaPredominante: 'USD - DÓLAR DOS EUA'
  },
  {
    id: '3',
    numeroReferencia: 'BIO-2025-003',
    referenciaInterna: 'BIO-2025-003',
    referenciaExterna: 'CMAU5555666677',
    tipoImportacao: 'CONTA_PROPRIA',
    unidade: 'CEARA',
    exportador: mockExportadores[2],
    armador: 'CMA CGM',
    frete: 18500,
    moeda: 'EUR',
    portoOrigemId: 'DEHAM', // Hamburg
    portoDestinoId: 'BRFOR', // Fortaleza
    dataEmbarquePrevista: '2025-02-01T00:00:00Z',
    dataETAPrevista: '2025-02-28T00:00:00Z',
    status: StatusEmbarque.PRE_EMBARQUE,
    containers: [],
    documentos: [],
    invoices: [],
    createdAt: '2025-01-20T11:20:00Z',
    updatedAt: '2025-01-20T11:20:00Z',
    observacoes: 'Maquinário especializado - necessário acompanhamento técnico'
  },
  {
    id: '4',
    numeroReferencia: 'BIO-2025-004',
    referenciaInterna: 'BIO-2025-004',
    referenciaExterna: 'EVER777888999',
    tipoImportacao: 'VIA_TRADE', 
    unidade: 'SANTA_CATARINA',
    exportador: mockExportadores[0],
    armador: 'Evergreen',
    frete: 12800,
    moeda: 'USD',
    portoOrigemId: 'CNSHA', // Shanghai
    portoDestinoId: 'BRSSZ', // Santos
    dataEmbarquePrevista: '2025-02-05T00:00:00Z',
    dataETAPrevista: '2025-03-05T00:00:00Z',
    status: StatusEmbarque.PRESENCA_CARGA,
    containers: [],
    documentos: [],
    invoices: [],
    createdAt: '2025-01-25T13:45:00Z',
    updatedAt: '2025-02-28T09:30:00Z',
    observacoes: 'Aguardando liberação da Receita Federal'
  },
  {
    id: '5',
    numeroReferencia: 'BIO-2025-005',
    referenciaInterna: 'BIO-2025-005',
    referenciaExterna: 'COSU111222333',
    tipoImportacao: 'CONTA_PROPRIA',
    unidade: 'CEARA',
    exportador: mockExportadores[1],
    armador: 'COSCO',
    frete: 16200,
    moeda: 'USD',
    portoOrigemId: 'HKHKG', // Hong Kong  
    portoDestinoId: 'BRFOR', // Fortaleza
    dataEmbarquePrevista: '2025-02-10T00:00:00Z',
    dataETAPrevista: '2025-03-10T00:00:00Z', 
    status: StatusEmbarque.LIBERADO_CARREGAMENTO,
    containers: [],
    documentos: [],
    invoices: [],
    createdAt: '2025-02-01T07:15:00Z',
    updatedAt: '2025-03-08T11:20:00Z',
    observacoes: 'Pronto para retirada - coordenar com transportadora'
  }
]

// Próximas ações baseadas nos embarques
const mockProximasAcoes = [
  {
    id: 'acao1',
    embarqueId: '1',
    numeroReferencia: 'BIO-2025-001',
    acao: 'Confirmar chegada ao porto',
    prazo: '2025-02-15T23:59:59Z',
    prioridade: 'alta',
    exportador: 'ChemCorp Industries Ltd'
  },
  {
    id: 'acao2', 
    embarqueId: '4',
    numeroReferencia: 'BIO-2025-004',
    acao: 'Presença de carga vence em 2 dias',
    prazo: '2025-03-01T23:59:59Z',
    prioridade: 'alta',
    exportador: 'ChemCorp Industries Ltd'
  },
  {
    id: 'acao3',
    embarqueId: '5', 
    numeroReferencia: 'BIO-2025-005',
    acao: 'Agendar retirada com transportadora',
    prazo: '2025-03-12T23:59:59Z',
    prioridade: 'media',
    exportador: 'Global Supplies Ltd'
  },
  {
    id: 'acao4',
    embarqueId: '2',
    numeroReferencia: 'BIO-2025-002', 
    acao: 'Documentos para análise fiscal',
    prazo: '2025-02-25T23:59:59Z',
    prioridade: 'media',
    exportador: 'Global Supplies Ltd'
  }
]

// Mock entrepostos aduaneiros
const mockEntrepostos = [
  {
    id: 'ent1',
    embarqueId: '1',
    numeroReferencia: 'BIO-2025-001',
    tipoEntreposto: 'CLIA',
    numeroDA: 'DA-2025-0001',
    dataRegistro: '2025-01-15T08:00:00Z',
    prazoVencimento: '2025-07-13T23:59:59Z', // 180 dias
    status: 'ATIVO',
    exportador: {
      id: 'exp1',
      nomeEmpresa: 'ChemCorp Industries Ltd',
      paisOrigem: 'China'
    },
    valorTotalMercadorias: 81688.80,
    moeda: 'USD',
    totalRetiradas: 2,
    saldoDisponivel: [
      {
        id: 'saldo1',
        invoiceId: 'inv1',
        numeroInvoice: 'SHYD9241115726',
        codigoProduto: 'YD-8238',
        descricaoProduto: 'POLYETHER POLYOL YD-8238',
        quantidadeOriginal: 11760,
        quantidadeRetirada: 2000,
        quantidadeDisponivel: 9760,
        unidade: 'KG',
        pesoLiquidoOriginal: 11760,
        pesoLiquidoRetirado: 2000,
        pesoLiquidoDisponivel: 9760,
        valorUnitario: 2.45,
        valorTotalDisponivel: 23912.00,
        ncm: '39072090',
        lote: 'YD823801252025'
      },
      {
        id: 'saldo2',
        invoiceId: 'inv1',
        numeroInvoice: 'SHYD9241115726',
        codigoProduto: 'CT-405',
        descricaoProduto: 'CATALYST BLEND CT-405',
        quantidadeOriginal: 5800,
        quantidadeRetirada: 800,
        quantidadeDisponivel: 5000,
        unidade: 'KG',
        pesoLiquidoOriginal: 5800,
        pesoLiquidoRetirado: 800,
        pesoLiquidoDisponivel: 5000,
        valorUnitario: 8.95,
        valorTotalDisponivel: 44750.00,
        ncm: '38159090',
        lote: 'CT40501252025'
      }
    ]
  },
  {
    id: 'ent2',
    embarqueId: '2',
    numeroReferencia: 'BIO-2025-002',
    tipoEntreposto: 'EADI',
    numeroDA: 'DA-2025-0002',
    dataRegistro: '2025-01-20T10:30:00Z',
    prazoVencimento: '2025-07-18T23:59:59Z',
    status: 'ATIVO',
    exportador: {
      id: 'exp2',
      nomeEmpresa: 'Global Supplies Ltd',
      paisOrigem: 'Hong Kong'
    },
    valorTotalMercadorias: 45280.00,
    moeda: 'USD',
    totalRetiradas: 0,
    saldoDisponivel: [
      {
        id: 'saldo3',
        invoiceId: 'inv2',
        numeroInvoice: 'GSL2024001156',
        codigoProduto: 'P-350',
        descricaoProduto: 'INDUSTRIAL PUMP P-350',
        quantidadeOriginal: 1,
        quantidadeRetirada: 0,
        quantidadeDisponivel: 1,
        unidade: 'PC',
        pesoLiquidoOriginal: 850,
        pesoLiquidoRetirado: 0,
        pesoLiquidoDisponivel: 850,
        valorUnitario: 42500.00,
        valorTotalDisponivel: 42500.00,
        ncm: '84135090',
        lote: 'P35001252025'
      },
      {
        id: 'saldo4',
        invoiceId: 'inv2',
        numeroInvoice: 'GSL2024001156',
        codigoProduto: 'SPK-P350',
        descricaoProduto: 'SPARE PARTS KIT',
        quantidadeOriginal: 1,
        quantidadeRetirada: 0,
        quantidadeDisponivel: 1,
        unidade: 'SET',
        pesoLiquidoOriginal: 125,
        pesoLiquidoRetirado: 0,
        pesoLiquidoDisponivel: 125,
        valorUnitario: 2780.00,
        valorTotalDisponivel: 2780.00,
        ncm: '84135090',
        lote: 'SPK35001252025'
      }
    ]
  }
]

module.exports = {
  StatusEmbarque,
  mockExportadores,
  mockInvoices,
  mockContainers,
  mockDocumentos,
  mockEmbarques,
  mockProximasAcoes,
  mockEntrepostos
}