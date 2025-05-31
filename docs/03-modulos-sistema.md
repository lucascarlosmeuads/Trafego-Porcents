
# 3. Módulos do Sistema

## 📊 Dashboard e Métricas

### Dashboard Admin
- **Funil de Status**: Visualização dos clientes por etapa
- **Métricas Globais**: Total de clientes, campanhas ativas, receita
- **Performance por Gestor**: Ranking e estatísticas
- **Problemas Pendentes**: Alertas de clientes com issues
- **🆕 Chat Overview**: Visão geral de todas as conversas ativas

### Dashboard Gestor
- **Clientes Ativos**: Lista filtrada por gestor
- **Problemas da Equipe**: Clientes com problemas para resolver
- **Métricas da Gestoria**: Performance específica
- **Comissões Pendentes**: Controle financeiro
- **🆕 Chat Integrado**: Acesso direto às conversas com clientes

### Dashboard Vendedor
- **Vendas Pessoais**: Clientes cadastrados pelo vendedor
- **Métricas de Conversão**: Taxa de sucesso
- **Metas e Objetivos**: Acompanhamento de performance
- **Clientes Recentes**: Últimos cadastros

### Dashboard Cliente
- **Status da Campanha**: Progresso atual
- **Próximos Passos**: O que precisa ser feito
- **Materiais Enviados**: Histórico de uploads
- **🆕 Chat com Gestor**: Comunicação direta e instantânea

---

## 👥 Gestão de Clientes

### CRUD Completo
- **Criar**: Formulário completo de cadastro
- **Visualizar**: Lista paginada com filtros
- **Editar**: Atualização de dados em tempo real
- **Status**: Controle de estados da campanha

### Funcionalidades Avançadas
- **Filtros Inteligentes**: Por status, gestor, data, problema
- **Busca Rápida**: Por nome, email, telefone
- **Exportação**: Relatórios em diversos formatos
- **Comentários**: Sistema de comunicação interna
- **🆕 Chat Integrado**: Comunicação direta na tela do cliente

### Estados do Cliente
```
Cliente Novo → Preenchimento Formulário → Brief → 
Criativo → Site → Agendamento → Configurando BM → 
Subindo Campanha → Otimização → Saque Pendente
```

---

## 🎯 Sistema de Campanhas

### Controle de Status
- **15 Estados Diferentes**: Desde "Cliente Novo" até "Saque Pendente"
- **Transições Controladas**: Validação de mudanças de estado
- **Prazos Automáticos**: Cálculo de data limite (15 dias da venda)
- **Alertas**: Notificações para atrasos

### Status Especiais
- **Problema**: Clientes com issues específicas
- **Cliente Sumiu**: Quando não há resposta
- **Reembolso**: Processo de devolução
- **Urgente**: Prioridade alta
- **Campanha Anual**: Contratos longos

---

## 📝 Briefings e Materiais

### Sistema de Briefing
- **Formulário Estruturado**: Campos obrigatórios e opcionais
- **Edição Controlada**: Liberação pelo gestor
- **Versionamento**: Histórico de alterações
- **Validação**: Campos obrigatórios antes da aprovação

### Upload de Materiais
- **Múltiplos Formatos**: Imagens, vídeos, documentos
- **Organização**: Por cliente e tipo de material
- **Controle de Acesso**: Apenas cliente e gestor veem
- **Histórico**: Log de todos os uploads
- **🆕 Storage Integrado**: Supabase Storage para arquivos

---

## 💬 Sistema de Chat (NOVO)

### Comunicação em Tempo Real
- **Conexão Direta**: Gestor ↔ Cliente
- **Mensagens Instantâneas**: Realtime via Supabase
- **Indicadores Visuais**: Status de leitura, typing indicators
- **Histórico Completo**: Todas as conversas preservadas

### Funcionalidades do Chat
- **Mensagens de Texto**: Comunicação escrita básica
- **Mensagens de Áudio**: Gravação e reprodução de áudios
- **Indicadores de Status**: Lida/não lida, online/offline
- **Notificações**: Alertas para novas mensagens

### Permissões de Chat
- **Admin**: Visão geral de todas as conversas
- **Gestor**: Chat com clientes da sua gestoria
- **Cliente**: Chat apenas com seu gestor
- **Outros perfis**: Sem acesso ao chat

---

## 🎤 Sistema de Áudio (NOVO)

### Gravação de Áudio
- **Gravação Direta**: Pelo navegador (WebRTC)
- **Formato Otimizado**: WebM com codec Opus
- **Controles Intuitivos**: Start/stop, preview, delete
- **Indicador Visual**: Timer e status de gravação

### Reprodução de Áudio
- **Player Integrado**: Controles de play/pause
- **Duração**: Exibição do tempo total
- **Tratamento de Erros**: Fallbacks para problemas de rede
- **Cache Inteligente**: Otimização de carregamento

### Storage de Áudios
- **Supabase Storage**: Bucket dedicado para áudios
- **URLs Públicas**: Acesso direto para reprodução
- **Organização**: Por usuário e timestamp
- **Limpeza Automática**: Remoção de arquivos antigos

---

## 💰 Sistema de Comissões

### Controle Financeiro
- **Status de Pagamento**: Pendente, Pago, Cancelado
- **Valores Personalizados**: Por cliente ou padrão (R$ 60)
- **Solicitações de Saque**: Workflow de aprovação
- **Relatórios**: Comissões por período e gestor

### Workflow de Pagamento
```
Campanha no Ar → Solicitação Saque → 
Aprovação Admin → Pagamento → Confirmação
```

---

## 📁 Sistema de Storage (NOVO)

### Gestão de Arquivos
- **Múltiplos Buckets**: Separação por tipo de conteúdo
- **Upload Seguro**: Validação de tipo e tamanho
- **URLs Públicas**: Acesso controlado aos arquivos
- **Políticas RLS**: Segurança granular

### Buckets Configurados
- **chat-audios**: Mensagens de áudio do chat
- **client-materials**: Materiais enviados pelos clientes
- **campaign-assets**: Assets das campanhas

### Funcionalidades
- **Preview de Arquivos**: Visualização antes do upload
- **Progress Indicators**: Status do upload em tempo real
- **Error Handling**: Tratamento robusto de erros
- **Retry Logic**: Tentativas automáticas em caso de falha

---

## 🔍 Auditoria e Relatórios

### Logs de Atividade
- **Todas as Ações**: Create, Update, Delete
- **Timestamp**: Data e hora exatas
- **Responsável**: Quem fez a alteração
- **Detalhes**: O que foi alterado
- **🆕 Chat Logs**: Histórico de mensagens

### Relatórios Disponíveis
- **Performance por Gestor**: Métricas individuais
- **Funil de Conversão**: Taxa por etapa
- **Tempo Médio por Status**: Eficiência do processo
- **Comissões**: Relatórios financeiros
- **🆕 Engajamento**: Métricas de uso do chat

---

## 🌐 Módulo de Sites

### Gestão de Criação
- **Fila de Trabalho**: Clientes que precisam de site
- **Status de Criação**: Pendente, Em Andamento, Finalizado
- **Links de Entrega**: Upload do site finalizado
- **Controle de Pagamento**: Status de pagamento do site

### Integração com Campanha
- **Dependência**: Site como pré-requisito para próximas etapas
- **Notificações**: Alertas quando site é necessário
- **Validação**: Verificação de links antes da progressão

---

## ⚙️ Configurações e Administração

### Gestão de Usuários
- **Criação Automática**: Geração de login para clientes
- **Controle de Acesso**: Baseado em domínio de email
- **Permissões**: Matriz granular por tipo de usuário
- **Desativação**: Soft delete mantendo histórico

### Configurações Globais
- **Status Customizados**: Adição de novos estados
- **Valores Padrão**: Comissões e configurações
- **Integrações**: APIs externas e webhooks
- **Backup**: Rotinas automáticas de segurança
- **🆕 Chat Settings**: Configurações do sistema de chat

---

## 🔄 Funcionalidades Realtime (NOVO)

### Atualizações em Tempo Real
- **Status Changes**: Mudanças de status instantâneas
- **New Messages**: Notificações de novas mensagens
- **User Presence**: Indicadores de usuário online
- **Live Updates**: Sincronização automática de dados

### Tecnologia
- **Supabase Realtime**: WebSocket connections
- **Subscription Management**: Controle de conexões
- **Error Recovery**: Reconexão automática
- **Performance**: Otimização de recursos

---

[← Anterior: Perfis de Usuário](./02-perfis-usuario.md) | [Próximo: Base de Dados →](./04-base-dados.md)
