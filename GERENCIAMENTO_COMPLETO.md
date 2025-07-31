# 🗄️ Guia Completo de Gerenciamento - Sistema Biocol Import

Este guia contempla **TODOS** os aspectos do sistema: banco de dados, Docker, frontend e backend.

## 🐘 Gerenciamento do Banco PostgreSQL

### 🚀 Opção 1: Com Docker (Recomendado)

```bash
# Subir apenas o banco PostgreSQL
docker-compose up -d postgres

# Verificar se o banco está rodando
docker ps | grep postgres

# Logs do banco
docker logs biocol-postgres

# Parar o banco
docker-compose stop postgres

# Remover completamente (⚠️ APAGA TODOS OS DADOS)
docker-compose down -v
```

### 🔧 Opção 2: PostgreSQL Local

```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco e usuário
sudo -u postgres psql
CREATE DATABASE biocol_import;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE biocol_import TO postgres;
\q
```

### 📊 Configuração do Banco

**Variáveis de Ambiente (.env):**
```bash
# Backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5433/biocol_import?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

### 🔄 Migrations do Prisma

```bash
# Gerar migrations
cd backend
npx prisma generate

# Executar migrations
npx prisma migrate dev

# Reset do banco (⚠️ APAGA TODOS OS DADOS)
npx prisma migrate reset

# Visualizar banco (Prisma Studio)
npx prisma studio
```

## 🐳 Gerenciamento com Docker Compose

### 🚀 Subir Stack Completa

```bash
# Subir tudo (banco + backend + frontend)
docker-compose up -d

# Verificar status
docker-compose ps

# Logs de todos os serviços
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 🔧 Comandos Específicos

```bash
# Subir apenas serviços específicos
docker-compose up -d postgres redis
docker-compose up -d backend
docker-compose up -d frontend

# Rebuild containers
docker-compose build
docker-compose up -d --build

# Parar serviços
docker-compose stop

# Remover completamente (⚠️ APAGA VOLUMES)
docker-compose down -v

# Executar comandos dentro do container
docker-compose exec backend npm run dev
docker-compose exec backend npx prisma migrate dev
docker-compose exec postgres psql -U postgres -d biocol_import
```

### 📈 Monitoramento Docker

```bash
# Status dos containers
docker stats

# Uso de espaço
docker system df

# Limpar cache do Docker
docker system prune -a

# Ver volumes
docker volume ls

# Inspecionar volume do banco
docker volume inspect simport_postgres_data
```

## 🚀 Gerenciamento da Aplicação (Desenvolvimento)

### 🔥 Opção A: Desenvolvimento Rápido (Mock APIs)

```bash
# Backend Mock (apenas para testar frontend)
cd /home/mcsaf/simport/backend && node -e "
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/entrepostos/create-from-embarque', (req, res) => {
  console.log('🏭 Criando entreposto:', req.body);
  res.json({ 
    success: true, 
    message: 'Entreposto criado com sucesso',
    data: { ...req.body, id: 'mock-' + Date.now() }
  });
});

app.get('/api/cadastros/empresas-entreposto', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: '1', nome: 'CLIA Santos', cnpj: '12345678000100', cidade: 'Santos', estado: 'SP' },
      { id: '2', nome: 'EADI Campinas', cnpj: '98765432000100', cidade: 'Campinas', estado: 'SP' },
      { id: '3', nome: 'CLIA Suape', cnpj: '11122233000100', cidade: 'Recife', estado: 'PE' }
    ]
  });
});

// Mock das outras APIs
app.get('/api/embarques', (req, res) => {
  res.json({ success: true, data: { data: [] } });
});

app.put('/api/embarques/:id', (req, res) => {
  console.log('📦 Atualizando embarque:', req.params.id, 'status:', req.body.status);
  res.json({ success: true, data: { id: req.params.id, ...req.body } });
});

app.get('/api/invoices/embarque/:id', (req, res) => {
  res.json({ success: true, data: [] });
});

app.listen(3001, () => {
  console.log('🚀 Backend Mock: http://localhost:3001');
  console.log('📊 Health: http://localhost:3001/health');
});
" &

# Frontend
cd /home/mcsaf/simport/frontend && npm run dev
```

### 💻 Opção B: Desenvolvimento Completo (Banco Real)

```bash
# 1. Subir banco PostgreSQL
docker-compose up -d postgres

# 2. Executar migrations
cd backend
npx prisma generate
npx prisma migrate dev

# 3. Backend com Prisma
npm run dev

# 4. Frontend (outro terminal)
cd ../frontend
npm run dev
```

### 🏭 Opção C: Produção Local (Docker Completo)

```bash
# Subir stack completa
docker-compose up -d

# Executar migrations no container
docker-compose exec backend npx prisma migrate deploy

# Opcional: Seed dados iniciais
docker-compose exec backend npx prisma db seed
```

## 📋 Verificação e Monitoramento

### 🔍 Verificar Processos Rodando

```bash
# Processos Node.js/Vite
ps aux | grep -E "(node|vite)" | grep -v grep

# Portas ocupadas
lsof -i :3001 -i :5173 -i :5433

# Containers Docker
docker ps

# Status Docker Compose
docker-compose ps
```

### 🔗 Testar Conectividade

```bash
# Backend
curl -s http://localhost:3001/health

# Banco (via Docker)
docker-compose exec postgres psql -U postgres -d biocol_import -c "SELECT version();"

# Banco (local)
psql -h localhost -p 5433 -U postgres -d biocol_import -c "SELECT version();"
```

### 📊 URLs da Aplicação

- **Frontend**: http://localhost:5173/
- **Backend**: http://localhost:3001/
- **Health Check**: http://localhost:3001/health
- **Prisma Studio**: http://localhost:5555/ (após `npx prisma studio`)
- **PostgreSQL**: localhost:5433

## 🛑 Parar e Limpar

### 🔄 Restart Rápido

```bash
# Parar processos Node.js
pkill -f "node.*simport" && pkill -f "vite"

# Parar Docker Compose
docker-compose stop

# Restart completo
docker-compose restart
```

### 🧹 Limpeza Completa

```bash
# Parar e remover containers (mantém volumes)
docker-compose down

# Parar e remover TUDO (⚠️ APAGA BANCO)
docker-compose down -v

# Limpar Docker completamente
docker system prune -a --volumes
```

## 🚨 Solução de Problemas

### 🔴 Porta 5433 Ocupada

```bash
# Ver o que está usando a porta
lsof -i :5433

# Parar PostgreSQL local se estiver rodando
sudo systemctl stop postgresql
```

### 🔴 Erro de Conexão com Banco

```bash
# Verificar se container está rodando
docker ps | grep postgres

# Verificar logs do banco
docker logs biocol-postgres

# Testar conexão manual
docker-compose exec postgres psql -U postgres -d biocol_import
```

### 🔴 Prisma Migrations Erro

```bash
# Reset completo do banco (⚠️ APAGA DADOS)
cd backend
npx prisma migrate reset

# Gerar client novamente
npx prisma generate

# Aplicar migrations
npx prisma migrate dev
```

### 🔴 Build Erro Docker

```bash
# Rebuild sem cache
docker-compose build --no-cache

# Verificar Dockerfiles
cat backend/Dockerfile.dev
cat frontend/Dockerfile.dev
```

## 🧪 Cenários de Teste

### 🎯 Teste Completo da Aplicação

1. **Subir banco**: `docker-compose up -d postgres`
2. **Executar migrations**: `cd backend && npx prisma migrate dev`
3. **Subir backend**: `npm run dev`
4. **Subir frontend**: `cd ../frontend && npm run dev`
5. **Acessar**: http://localhost:5173/
6. **Testar kanban**: Arrastar card para "Entrada Entreposto"
7. **Verificar banco**: `npx prisma studio`

### 🚀 Deploy Produção

```bash
# Variáveis de ambiente de produção
cp .env.example .env.production

# Build e deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Migrations de produção
docker-compose exec backend npx prisma migrate deploy
```

---

**📝 Resumo dos Ambientes:**

| Ambiente | Banco | Backend | Frontend | Uso |
|----------|-------|---------|----------|-----|
| **Mock** | ❌ | Node.js simples | npm run dev | Teste UI rápido |
| **Dev** | 🐳 Docker | npm run dev | npm run dev | Desenvolvimento |
| **Produção** | 🐳 Docker | 🐳 Docker | 🐳 Docker | Deploy completo |

**Última atualização**: 31/07/2025  
**Versão**: 2.0 - Guia completo com Docker e PostgreSQL