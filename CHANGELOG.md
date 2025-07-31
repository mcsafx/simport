# Changelog - Sistema Biocol Import

## [1.1.0] - 2025-07-31

### ✨ Novas Funcionalidades

#### 🔀 Reestruturação Visual do Kanban
- **Bifurcação real do workflow** após "Presença Carga"
- **Layout em seções organizadas**: Comum → Bifurcação → Convergência  
- **Trilhas paralelas visuais**: Nacionalização Direta vs Fluxo CLIA
- **Indicadores visuais distintos** para cada trilha com cores e ícones

#### 🏭 Automação de Entreposto Aduaneiro
- **Modal de DA automático** ao arrastar card para "Entrada Entreposto"
- **Criação automática** de `EntrepostoAduaneiro` no banco de dados
- **Validações obrigatórias** para campos críticos (número DA, empresa, tipo)
- **Cálculo automático** do prazo de vencimento (180 dias)
- **Criação automática** dos itens do entreposto a partir das invoices

#### 📋 Componente DAModal
- **Formulário completo** com validações em tempo real
- **Carregamento dinâmico** das empresas de entreposto
- **Interface intuitiva** com informações do embarque
- **Feedback visual** de processamento e erros

### 🔧 Melhorias Técnicas

#### Backend
- **Nova API** `/api/entrepostos/create-from-embarque` para automação
- **Transações atomicas** no Prisma para consistência dos dados
- **Validações robustas** de dados de entrada
- **Logs estruturados** para debug e monitoramento

#### Frontend  
- **Componente renderColumn()** para otimização de código
- **Estados de modal** gerenciados adequadamente
- **Tratamento de erros** aprimorado
- **Feedback visual** durante operações assíncronas

### 🧹 Limpeza e Organização
- **Removidos 18+ arquivos temporários** e de teste
- **Pastas vazias** removidas do projeto
- **Gitignore atualizado** com regras para arquivos temporários
- **Estrutura de pastas** otimizada e organizada

### 📚 Documentação
- **Guia de execução** completo (`execucao.md`)
- **Comandos copy & paste** para gerenciar a aplicação
- **Instruções de teste** da nova funcionalidade
- **Troubleshooting** para problemas comuns

### 🎯 Fluxo de Workflow Implementado

```
🚢 FLUXO COMUM
PRE_EMBARQUE → CARREGADO → TRÂNSITO → PORTO → PRESENCA_CARGA
                                                    ↓
                                               BIFURCAÇÃO

🚚 TRILHA A: NACIONALIZAÇÃO          🏭 TRILHA B: CLIA
REGISTRO_DI → CANAL → LIBERADO       ENTRADA* → AGUARDANDO → PARCIAL → COMPLETA
    ↓                                    ↓
    └────────────→ CONVERGÊNCIA ←────────┘
                      ↓
              AGENDAMENTO → ENTREGUE
```

**\* ENTRADA_ENTREPOSTO**: Automação ativa! Modal de DA abre automaticamente.

### 🧪 Como Testar
1. Acesse http://localhost:5173/
2. Vá para página "Kanban"  
3. Arraste um card de "Presença Carga" para "Entrada Entreposto"
4. Preencha o modal de DA que abre automaticamente
5. Confirme e veja o card mover para a trilha CLIA

---

## [1.0.0] - 2025-07-25

### 🎉 Versão Inicial
- Sistema base de gestão de importações
- Dashboard com métricas
- Cadastro de embarques
- Kanban linear básico
- Sistema de autenticação
- Integração com banco PostgreSQL