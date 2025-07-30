# 🚀 Guia de Execução - Sistema Biocol Import

**Versão:** MVP 1.0  
**Data:** 25 de Julho de 2025  
**Sistema:** Ubuntu 24.04 LTS

---

## ⚡ **Execução Rápida (3 Comandos)**

```bash
# 1. Banco de dados
docker compose up -d postgres

# 2. Backend (Terminal 1)
cd backend && node src/simple-server.js

# 3. Frontend (Terminal 2) 
cd frontend && npm run dev
```

**Acesse:** `http://localhost:5173`  
**Login:** `magnus@biocol.com.br` | Senha: `demo123`

---

## 📋 **Passo a Passo Detalhado**

### **Pré-requisitos**
- [x] Node.js 18+ instalado
- [x] Docker e Docker Compose instalados
- [x] Portas 3001, 5173 e 5433 livres

### **1. Preparar o Ambiente**

```bash
# Navegar para o diretório do projeto
cd /home/mcsaf/sisgimp

# Verificar se os arquivos existem
ls -la
# Deve mostrar: backend/, frontend/, docker-compose.yml
```

### **2. Iniciar o Banco de Dados**

```bash
# Subir PostgreSQL via Docker
docker compose up -d postgres

# Verificar se está rodando
docker compose ps
# Status deve ser "Up"

# Aguardar 5-10 segundos para inicialização completa
sleep 10
```

**✅ Confirmação:** Container `biocol-postgres` deve estar "Up"

### **3. Iniciar o Backend (Terminal 1)**

```bash
# Abrir novo terminal e navegar para backend
cd /home/mcsaf/sisgimp/backend

# Verificar se as dependências estão instaladas
ls node_modules/ || npm install

# Iniciar servidor de desenvolvimento
node src/simple-server.js
```

**✅ Confirmação:** Deve exibir:
```
🚀 Server running on http://localhost:3001
📊 Health check: http://localhost:3001/health
```

### **4. Iniciar o Frontend (Terminal 2)**

```bash
# Abrir outro terminal e navegar para frontend
cd /home/mcsaf/sisgimp/frontend

# Verificar dependências
ls node_modules/ || npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

**✅ Confirmação:** Deve exibir:
```
VITE v7.0.6  ready in XXXXms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### **5. Acessar a Aplicação**

1. **Abrir navegador:** `http://localhost:5173`
2. **Fazer login:**
   - Email: `magnus@biocol.com.br`
   - Senha: `demo123`
3. **Navegar pelo sistema:**
   - Dashboard (página inicial)
   - Embarques (menu lateral)
   - Logout (ícone no canto superior direito)

---

## 🔧 **Comandos Úteis**

### **Verificar Status dos Serviços**
```bash
# PostgreSQL
docker compose ps

# Portas em uso
ss -tlnp | grep -E "(3001|5173|5433)"

# Processos Node.js rodando
ps aux | grep node
```

### **Testar APIs Manualmente**
```bash
# Health check do backend
curl http://localhost:3001/health

# Teste de login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"magnus@biocol.com.br","password":"demo123"}'

# Listar embarques
curl http://localhost:3001/api/embarques

# Métricas do dashboard
curl http://localhost:3001/api/dashboard/metrics
```

### **Parar os Serviços**
```bash
# Parar frontend e backend
Ctrl+C em cada terminal

# Parar PostgreSQL
docker compose down

# Parar tudo de uma vez
docker compose down && pkill -f "node src/simple-server.js" && pkill -f "npm run dev"
```

---

## ⚠️ **Principais Problemas e Soluções**

### **1. Erro: "Port already in use"**

**Sintoma:**
```
Error: listen EADDRINUSE: address already in use :::3001
Error: listen EADDRINUSE: address already in use :::5173
```

**Solução:**
```bash
# Identificar processo na porta
sudo ss -tlnp | grep 3001
sudo ss -tlnp | grep 5173

# Matar processo específico
sudo fuser -k 3001/tcp
sudo fuser -k 5173/tcp

# Ou matar todos os processos Node
pkill -f node
```

### **2. Erro: PostgreSQL não conecta**

**Sintoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:5433
```

**Solução:**
```bash
# Verificar se container está rodando
docker compose ps

# Se não estiver, subir novamente
docker compose up -d postgres

# Verificar logs do container
docker compose logs postgres

# Aguardar inicialização completa
sleep 15
```

### **3. Erro: "Cannot find module" no Backend**

**Sintoma:**
```
Error: Cannot find module 'express'
Error: Cannot find module 'cors'
```

**Solução:**
```bash
cd backend

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar se instalou corretamente
ls node_modules/ | grep express
```

### **4. Erro: Frontend não carrega (tela branca)**

**Sintoma:**
- Página em branco
- Erro no console do navegador
- Vite não compila

**Solução:**
```bash
cd frontend

# Limpar cache e reinstalar
rm -rf node_modules package-lock.json dist
npm install

# Verificar se Tailwind foi configurado
ls tailwind.config.js postcss.config.js

# Tentar novamente
npm run dev
```

### **5. Erro: "Docker command not found"**

**Sintoma:**
```
bash: docker: command not found
bash: docker-compose: command not found
```

**Solução:**
```bash
# Instalar Docker (Ubuntu)
sudo apt update
sudo apt install docker.io docker-compose-v2

# Verificar instalação
docker --version
docker compose version

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### **6. Erro: Permissão negada no Docker**

**Sintoma:**
```
permission denied while trying to connect to the Docker daemon socket
```

**Solução:**
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Aplicar mudanças
newgrp docker

# Ou usar sudo temporariamente
sudo docker compose up -d postgres
```

### **7. Erro: "CORS blocked" no navegador**

**Sintoma:**
```
Access to fetch at 'http://localhost:3001/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solução:**
- ✅ **Já configurado no código**
- Verificar se backend está rodando
- Verificar URLs no arquivo `src/services/api.ts`

### **8. Erro: Login não funciona**

**Sintoma:**
- Credenciais rejeitadas
- Erro 401 Unauthorized

**Verificação:**
```bash
# Testar API diretamente
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"magnus@biocol.com.br","password":"demo123"}'
```

**Credenciais corretas:**
- Email: `magnus@biocol.com.br`
- Senha: `demo123`

---

## 🔍 **Diagnóstico Rápido**

### **Checklist de Verificação:**
```bash
# 1. Verificar se Docker está rodando
docker info > /dev/null 2>&1 && echo "✅ Docker OK" || echo "❌ Docker não está rodando"

# 2. Verificar PostgreSQL
docker compose ps | grep postgres && echo "✅ PostgreSQL OK" || echo "❌ PostgreSQL não está rodando"

# 3. Verificar portas
ss -tln | grep -E "(3001|5173|5433)" && echo "✅ Portas em uso" || echo "❌ Nenhuma porta em uso"

# 4. Verificar backend
curl -s http://localhost:3001/health > /dev/null && echo "✅ Backend OK" || echo "❌ Backend não responde"

# 5. Verificar frontend
curl -s http://localhost:5173 > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend não responde"
```

### **Script de Diagnóstico Completo:**
```bash
#!/bin/bash
echo "🔍 Diagnóstico do Sistema Biocol Import"
echo "======================================"

# Verificar Docker
if docker info > /dev/null 2>&1; then
    echo "✅ Docker: Funcionando"
else
    echo "❌ Docker: Não está rodando"
fi

# Verificar PostgreSQL
if docker compose ps | grep -q postgres.*Up; then
    echo "✅ PostgreSQL: Rodando"
else
    echo "❌ PostgreSQL: Não está rodando"
fi

# Verificar Backend
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend: Respondendo"
else
    echo "❌ Backend: Não responde"
fi

# Verificar Frontend
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend: Disponível"
else
    echo "❌ Frontend: Não disponível"
fi

echo "======================================"
echo "🎯 Se tudo estiver ✅, acesse: http://localhost:5173"
```

---

## 📱 **Testando a Aplicação**

### **Fluxo de Teste Básico:**

1. **Login:**
   - Acessar `http://localhost:5173`
   - Inserir credenciais: `magnus@biocol.com.br` / `demo123`
   - Clicar "Entrar"

2. **Dashboard:**
   - Visualizar métricas (24 embarques, 18 em andamento, etc.)
   - Verificar cards de status
   - Ver próximas ações

3. **Embarques:**
   - Clicar "Embarques" no menu lateral
   - Ver listagem de embarques
   - Testar filtros (dropdown)
   - Verificar dados detalhados

4. **Logout:**
   - Clicar ícone de saída (seta) no header
   - Verificar redirecionamento para login

### **Recursos Funcionais:**
- ✅ Autenticação com JWT
- ✅ Proteção de rotas
- ✅ Dashboard com dados reais da API
- ✅ Listagem de embarques
- ✅ Design responsivo
- ✅ Persistência de sessão

---

## 🚨 **Em Caso de Emergência**

### **Reset Completo do Sistema:**
```bash
# Parar tudo
docker compose down -v
pkill -f node

# Limpar caches
cd frontend && rm -rf node_modules dist
cd ../backend && rm -rf node_modules

# Reinstalar tudo
cd frontend && npm install
cd ../backend && npm install

# Subir novamente
docker compose up -d postgres
cd backend && node src/simple-server.js &
cd frontend && npm run dev
```

### **Restaurar Banco de Dados:**
```bash
# Remover volumes do Docker
docker compose down -v

# Subir novamente (recria o banco limpo)
docker compose up -d postgres

# Aguardar inicialização
sleep 10

# Executar migrations (se necessário)
cd backend && npm run prisma:migrate
```

---

## 📞 **Contato e Suporte**

Se os problemas persistirem:

1. **Verificar logs:**
   ```bash
   # Logs do PostgreSQL
   docker compose logs postgres
   
   # Logs do sistema
   dmesg | tail -20
   ```

2. **Informações do sistema:**
   ```bash
   # Versões
   node --version
   npm --version
   docker --version
   
   # Recursos disponíveis
   free -h
   df -h
   ```

3. **Estado das portas:**
   ```bash
   ss -tlnp | grep -E "(3001|5173|5433)"
   ```

---

**Sistema testado e funcionando em Ubuntu 24.04 LTS** ✅  
**Desenvolvido com Node.js 20.19.3, Docker 28.3.2** 🚀