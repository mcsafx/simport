# PRD - Sistema de Gestão de Importações Biocol

## 1. Visão Geral do Produto

### 1.1 Objetivo
Desenvolver um sistema web para gestão completa dos processos de importação da Biocol Importadora e Distribuidora S/A, centralizando controle de embarques, documentação, workflow aduaneiro e entrepostos.

### 1.2 Problema Atual
- Gestão via e-mails fragmentada e desorganizada
- Ferramentas existentes não se comunicam (Focco ERP, Ploomes CRM, Logmanager, Conexos Cloud)
- Falta de visibilidade unificada dos processos
- Controle manual de checkpoints e prazos

### 1.3 Proposta de Valor
- Centralização de todos os processos de importação
- Workflow automatizado com checkpoints e alertas
- Dashboard com visibilidade completa
- Gestão integrada de entrepostos aduaneiros
- Extração automática de dados de documentos

## 2. Personas e Usuários

### 2.1 Usuário Principal
**Magnus - Coordenador de Logística**
- Gerencia importações das unidades CE e SC
- Coordena processos próprios e via trade (Capital Trade)
- Necessita visibilidade completa e controle de prazos

### 2.2 Usuários Secundários
- Equipe de logística
- Despachantes aduaneiros
- Gestores comerciais

## 3. Arquitetura e Stack Tecnológico

### 3.1 Frontend
- **Framework**: React 18+ com TypeScript
- **Styling**: Tailwind CSS (design moderno, cantos arredondados estilo Apple)
- **Estado**: Context API + React Query
- **Roteamento**: React Router
- **UI Components**: Headless UI + custom components

### 3.2 Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Banco**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT + bcrypt
- **Upload/Storage**: AWS S3 ou similar
- **OCR/Extração**: Tesseract.js + PDF parsing libraries

### 3.3 Infraestrutura
- **Deploy**: Docker containers
- **Cloud**: AWS/Azure
- **Monitoramento**: Logs estruturados

## 4. Funcionalidades Core

### 4.1 Gestão de Embarques

#### 4.1.1 Cadastro de Embarque
**Campos Obrigatórios:**
```typescript
interface Embarque {
  id: string;
  numeroReferencia: string;
  tipoImportacao: 'CONTA_PROPRIA' | 'VIA_TRADE';
  unidade: 'CEARA' | 'SANTA_CATARINA';
  exportador: Exportador;
  armador: string;
  frete: number;
  moeda: string;
  portoOrigemId: string;
  portoDestinoId: string;
  dataEmbarquePrevista: Date;
  dataETAPrevista: Date;
  status: StatusEmbarque;
  containers: Container[];
  documentos: Documento[];
}
```

#### 4.1.2 Status/Etapas do Workflow
```typescript
enum StatusEmbarque {
  PRE_EMBARQUE = 'PRE_EMBARQUE',
  CARREGADO_BORDO = 'CARREGADO_BORDO',
  EM_TRANSITO = 'EM_TRANSITO',
  CHEGADA_PORTO = 'CHEGADA_PORTO',
  PRESENCA_CARGA = 'PRESENCA_CARGA',
  REGISTRO_DI = 'REGISTRO_DI',
  CANAL_PARAMETRIZADO = 'CANAL_PARAMETRIZADO',
  LIBERADO_CARREGAMENTO = 'LIBERADO_CARREGAMENTO',
  AGENDAMENTO_RETIRADA = 'AGENDAMENTO_RETIRADA',
  ENTREGUE = 'ENTREGUE'
}
```

### 4.2 Dashboard Principal

#### 4.2.1 Métricas em Tempo Real
- Total de processos por status
- Embarques com atraso
- Próximas ações necessárias
- Custos e valores por período
- Gráficos de performance

#### 4.2.2 Filtros Inteligentes
- Por período
- Por unidade (CE/SC)
- Por tipo de importação
- Por status
- Por exportador

### 4.3 Visualização Kanban

#### 4.3.1 Colunas do Board
- Pré-embarque
- Em trânsito
- No porto
- Liberação aduaneira
- Entregue

#### 4.3.2 Cards dos Embarques
```typescript
interface KanbanCard {
  embarqueId: string;
  numeroReferencia: string;
  exportador: string;
  dataETAPrevista: Date;
  diasAtraso?: number;
  alertas: Alert[];
  proximaAcao: string;
}
```

### 4.4 Gestão de Entrepostos (CLIA/EADI)

#### 4.4.1 Fluxo de DA (Declaração de Admissão)
```typescript
interface EntrepostoAduaneiro {
  id: string;
  embarqueId: string;
  tipoEntreposto: 'CLIA' | 'EADI';
  numeroDA: string;
  dataRegistroDA: Date;
  prazoVencimento: Date; // 180 dias
  faturaOriginal: Fatura;
  saldoDisponivel: ItemSaldo[];
  retiradas: RetiradeEntreposto[];
}
```

#### 4.4.2 Gestão de Retiradas Parciais
```typescript
interface RetiradaEntreposto {
  id: string;
  entrepostoId: string;
  novaFaturaReferencia: string; // Ex: "FA.250599A"
  itensRetirada: ItemRetirada[];
  numeroDI: string;
  dataRegistroDI: Date;
  status: StatusRetirada;
}

interface ItemRetirada {
  itemOriginalId: string;
  quantidadeRetirada: number;
  valorUnitario: number;
  ncm: string;
}
```

### 4.5 Extração Automática de Documentos

#### 4.5.1 Tipos de Documentos Suportados
- Bill of Lading (BL)
- Air Waybill (AWB)
- Invoice comercial
- Packing List
- Certificado de Origem
- COA (Certificate of Analysis)

#### 4.5.2 Dados Extraídos Automaticamente
```typescript
interface DadosExtraidos {
  numeroConteiner: string[];
  portoOrigem: string;
  portoDestino: string;
  freeTime: number;
  tipoCarga: 'NORMAL' | 'PERIGOSA' | 'REFRIGERADA';
  itensComerciais: ItemComercial[];
  peso: number;
  volume: number;
  embalagens: TipoEmbalagem[];
}
```

### 4.6 Gestão de Exportadores/Fabricantes

#### 4.6.1 Cadastro de Exportadores
```typescript
interface Exportador {
  id: string;
  nomeEmpresa: string;
  endereco: Endereco;
  contatos: Contato[];
  documentos: string[];
  paisOrigem: string;
  produtos: string[];
  observacoes: string;
}
```

## 5. Interface do Usuário

### 5.1 Design System
- **Cores**: Paleta moderna com primary blue (#2563eb)
- **Typography**: Inter ou SF Pro (Apple-like)
- **Componentes**: Cantos arredondados (8px-16px)
- **Spacing**: Sistema de 8pt grid
- **Animações**: Micro-interactions suaves

### 5.2 Layouts Principais

#### 5.2.1 Dashboard
- Header com navegação e filtros
- Cards de métricas principais
- Gráficos interativos
- Lista de ações pendentes

#### 5.2.2 Gestão de Embarques
- Tabela com filtros avançados
- Formulário de cadastro step-by-step
- Visualização detalhada por embarque

#### 5.2.3 Kanban Board
- Drag & drop entre colunas
- Filtros laterais
- Quick actions nos cards

## 6. APIs e Integrações

### 6.1 Endpoints Principais

```typescript
// Embarques
GET /api/embarques
POST /api/embarques
PUT /api/embarques/:id
DELETE /api/embarques/:id

// Dashboard
GET /api/dashboard/metrics
GET /api/dashboard/alerts

// Entrepostos
POST /api/entrepostos
GET /api/entrepostos/:id/saldo
POST /api/entrepostos/:id/retiradas

// Documentos
POST /api/documentos/upload
POST /api/documentos/extract
```

### 6.2 Integração com Sistemas Existentes
- **Focco ERP**: Webhook para sincronização de dados financeiros
- **Ploomes CRM**: API para dados de clientes
- **Logmanager**: Tracking de cargas
- **Conexos Cloud**: Dados aduaneiros

## 7. Segurança e Compliance

### 7.1 Autenticação e Autorização
- Login seguro com JWT
- Roles: Admin, Coordenador, Operador, Visualizador
- Auditoria de ações

### 7.2 Proteção de Dados
- Criptografia de dados sensíveis
- Backup automático
- LGPD compliance

## 8. Performance e Escalabilidade

### 8.1 Otimizações
- Lazy loading de componentes
- Paginação de listas grandes
- Cache inteligente
- Compressão de imagens

### 8.2 Métricas de Performance
- Tempo de carregamento < 3s
- Time to Interactive < 5s
- Disponibilidade > 99.5%

## 9. Cronograma de Desenvolvimento

### Fase 1 (4 semanas) - MVP
- Setup do projeto
- Cadastro de embarques
- Dashboard básico
- Sistema de autenticação

### Fase 2 (3 semanas) - Workflow
- Kanban board
- Gestão de status
- Sistema de alertas

### Fase 3 (4 semanas) - Entrepostos
- Fluxo de CLIA/EADI
- Retiradas parciais
- Controle de saldos

### Fase 4 (3 semanas) - Automação
- Extração de documentos
- Integrações APIs
- Relatórios avançados

### Fase 5 (2 semanas) - Refinamentos
- Otimizações de performance
- Testes finais
- Deploy produção

## 10. Critérios de Aceite

### 10.1 Funcionalidades Críticas
- [x] Cadastro completo de embarques
- [x] Workflow com todos os status
- [x] Dashboard com métricas em tempo real
- [x] Gestão de entrepostos funcionando
- [x] Extração básica de documentos
- [x] Kanban interativo

### 10.2 Performance
- [x] Carregamento inicial < 3s
- [x] Navegação fluida sem travamentos
- [x] Upload de documentos < 30s
- [x] Responsivo em dispositivos móveis

### 10.3 Usabilidade
- [x] Interface intuitiva sem treinamento
- [x] Feedbacks visuais claros
- [x] Busca e filtros eficientes
- [x] Acessibilidade básica

---

**Notas para Implementação:**
- Priorizar funcionalidades do MVP primeiro
- Implementar testes automatizados desde o início
- Usar metodologia ágil com sprints semanais
- Feedback contínuo do usuário (Magnus)
- Documentação técnica em paralelo ao desenvolvimento