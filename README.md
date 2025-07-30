# Sistema de Gestão de Importações Biocol

Sistema web para gestão completa dos processos de importação da Biocol Importadora e Distribuidora S/A.

## 🚀 Tecnologias

### Frontend
- React 18+ com TypeScript
- Vite
- Tailwind CSS
- React Query
- React Hook Form
- React DnD (Kanban)
- Recharts (Dashboard)

### Backend
- Node.js 18+ com TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Multer (File Upload)
- Tesseract.js (OCR)

## 🏗️ Estrutura do Projeto

```
sisgimp/
├── frontend/          # React application
├── backend/           # Node.js API
├── docker-compose.yml # Development environment
└── README.md
```

## 🛠️ Desenvolvimento

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- PostgreSQL (via Docker)

### Setup Local

1. Clone o repositório
```bash
git clone <repository-url>
cd sisgimp
```

2. Suba o ambiente de desenvolvimento
```bash
docker-compose up -d
```

3. Frontend
```bash
cd frontend
npm install
npm run dev
```

4. Backend
```bash
cd backend
npm install
npm run dev
```

## 📋 Funcionalidades

### Fase 1 - MVP
- ✅ Sistema de autenticação
- ✅ Cadastro de embarques
- ✅ Dashboard básico
- ✅ Listagem e filtros

### Próximas Fases
- Kanban Board
- Gestão de Entrepostos (CLIA/EADI)
- Extração automática de documentos
- Integrações com sistemas existentes

## 👥 Usuários

- **Magnus** - Coordenador de Logística (usuário principal)
- Equipe de logística
- Despachantes aduaneiros
- Gestores comerciais

## 📄 Documentação

Para mais detalhes sobre arquitetura e especificações, consulte:
- [CLAUDE.md](./CLAUDE.md) - Guia para desenvolvimento
- [PRD](./prd_biocol_import_system.md) - Documento de requisitos do produto