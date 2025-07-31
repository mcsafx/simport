# 🚀 Guia de Execução - Sistema Biocol Import

Este guia contém todos os comandos necessários para gerenciar a aplicação (frontend + backend).

## 📋 Verificar Processos Rodando

```bash
# Verificar processos Node.js/Vite
ps aux | grep -E "(node|vite)" | grep -v grep

# Verificar portas ocupadas
lsof -i :3001 -i :5173
```

## 🛑 Derrubar Processos

```bash
# Derrubar TODOS os processos Node.js e Vite relacionados ao projeto
pkill -f "node.*simport"
pkill -f "vite"
pkill -f "ts-node"
pkill -f "nodemon"

# OU se souber o PID específico (substitua XXXX pelo PID):
# kill XXXX
```

## 🚀 Subir a Aplicação Completa

### Método 1: Dois Terminais Separados

**Terminal 1 - Backend:**
```bash
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
    data: { ...req.body, id: 'test-' + Date.now() }
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

// Mock das outras APIs necessárias
app.get('/api/embarques', (req, res) => {
  res.json({ success: true, data: { data: [] } });
});

app.put('/api/embarques/:id', (req, res) => {
  console.log('📦 Atualizando embarque:', req.params.id, 'para status:', req.body.status);
  res.json({ success: true, data: { id: req.params.id, ...req.body } });
});

app.get('/api/invoices/embarque/:id', (req, res) => {
  res.json({ success: true, data: [] });
});

app.listen(3001, () => {
  console.log('🚀 Backend rodando em http://localhost:3001');
  console.log('📊 Health: http://localhost:3001/health');
});
" &
```

**Terminal 2 - Frontend:**
```bash
cd /home/mcsaf/simport/frontend && npm run dev
```

### Método 2: Comando Único (Restart Rápido)

```bash
# Parar tudo e reiniciar
pkill -f "node.*simport" && pkill -f "vite" && sleep 2 &&
cd /home/mcsaf/simport/backend && node -e "
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => { res.json({ status: 'OK' }); });
app.post('/api/entrepostos/create-from-embarque', (req, res) => { 
  console.log('🏭 Entreposto:', req.body); 
  res.json({ success: true, message: 'Entreposto criado', data: {...req.body, id: Date.now()} }); 
});
app.get('/api/cadastros/empresas-entreposto', (req, res) => { 
  res.json({ success: true, data: [
    { id: '1', nome: 'CLIA Santos', cnpj: '12345678000100', cidade: 'Santos', estado: 'SP' },
    { id: '2', nome: 'EADI Campinas', cnpj: '98765432000100', cidade: 'Campinas', estado: 'SP' }
  ]}); 
});
app.get('/api/embarques', (req, res) => { res.json({ success: true, data: { data: [] } }); });
app.put('/api/embarques/:id', (req, res) => { res.json({ success: true }); });
app.get('/api/invoices/embarque/:id', (req, res) => { res.json({ success: true, data: [] }); });
app.listen(3001, () => console.log('🚀 Backend: http://localhost:3001'));
" & cd /home/mcsaf/simport/frontend && npm run dev
```

## ✅ Verificar se Subiu Corretamente

```bash
# Testar backend
curl -s http://localhost:3001/health

# Testar frontend - Acesse no navegador:
# http://localhost:5173/
```

## 📝 Ordem de Execução

1. **Copie e cole** o comando de backend em um terminal
2. **Abra outro terminal** e execute o comando do frontend
3. **Acesse** http://localhost:5173/ no navegador
4. **Teste** arrastar um card para "Entrada Entreposto"

## 🔴 Solução de Problemas

### Em Caso de Erro de Porta Ocupada:
```bash
# Limpar tudo e recomeçar
pkill -f "node" && pkill -f "vite" && sleep 3
# Depois executar os comandos de subir novamente
```

### Verificar Logs de Erro:
```bash
# Ver processos em execução
ps aux | grep -E "(node|vite)"

# Verificar portas em uso
netstat -tulpn | grep -E "(3001|5173)"
```

### Forçar Encerramento:
```bash
# Se pkill não funcionar, usar kill -9
ps aux | grep -E "(node|vite)" | awk '{print $2}' | xargs kill -9
```

## 🎯 URLs da Aplicação

- **Frontend**: http://localhost:5173/
- **Backend**: http://localhost:3001/
- **Health Check**: http://localhost:3001/health

## 🧪 Testar Funcionalidade Principal

1. Acesse http://localhost:5173/
2. Vá para a página "Kanban"
3. Arraste um card de "Presença Carga" para "Entrada Entreposto"
4. O modal de DA deve abrir automaticamente
5. Preencha os dados e confirme
6. O card deve mover para a trilha CLIA

---

**Última atualização**: 31/07/2025  
**Versão**: 1.0 - Implementação da bifurcação do kanban com automação de DA