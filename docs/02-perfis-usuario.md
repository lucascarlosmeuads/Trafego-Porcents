
# 2. Perfis de Usuário e Permissões

## 👑 Admin (@admin)
**Acesso Total ao Sistema**

### Permissões
- ✅ Visualizar todos os clientes e campanhas
- ✅ Gerenciar gestores (criar, editar, desativar)
- ✅ Acessar dashboard completo com métricas globais
- ✅ Realizar auditoria e relatórios
- ✅ Importar vendas manuais
- ✅ Criar usuários para clientes
- ✅ Gerenciar sites e domínios
- ✅ **Monitorar todas as conversas de chat**
- ✅ **Acessar visão geral de comunicações**

### Funcionalidades Exclusivas
- Dashboard administrativo
- Gestão de gestores
- Auditoria completa
- Importação de dados
- Configurações globais
- **Visão geral do sistema de chat**

---

## 👨‍💼 Gestor (@trafegoporcents.com)
**Gerenciamento de Equipe e Clientes**

### Permissões
- ✅ Visualizar clientes da sua gestoria
- ✅ Editar status e informações dos clientes
- ✅ Acessar métricas da equipe
- ✅ Gerenciar problemas e comentários
- ✅ Controlar comissões da equipe
- ✅ **Chat direto com clientes da gestoria**
- ✅ **Enviar/receber mensagens de áudio**
- ✅ **Visualizar materiais enviados pelos clientes**
- ❌ Não pode ver clientes de outros gestores

### Funcionalidades Principais
- Dashboard de gestão
- Lista de clientes ativos
- Gerenciamento de problemas
- Controle de comissões
- Métricas de performance
- **Sistema de chat integrado**
- **Gravação e reprodução de áudios**

---

## 💼 Vendedor (vendedor*@trafegoporcents.com)
**Captação e Cadastro de Clientes**

### Permissões
- ✅ Cadastrar novos clientes
- ✅ Visualizar suas vendas
- ✅ Acompanhar métricas pessoais
- ✅ Criar login para clientes
- ❌ Não pode editar clientes existentes
- ❌ **Não tem acesso ao sistema de chat**

### Funcionalidades Principais
- Formulário de cadastro de clientes
- Dashboard de vendas pessoais
- Lista de clientes cadastrados
- Métricas de performance

---

## 👤 Cliente (email individual)
**Participação no Processo de Campanha**

### Permissões
- ✅ Preencher briefing da campanha
- ✅ Fazer upload de materiais
- ✅ Acompanhar status da campanha
- ✅ Registrar vendas realizadas
- ✅ **Chat direto com seu gestor**
- ✅ **Enviar mensagens de áudio**
- ✅ **Receber orientações via áudio**
- ❌ Não pode ver dados de outros clientes

### Funcionalidades Principais
- Painel de boas-vindas
- Formulário de briefing
- Upload de arquivos/materiais
- Registro de vendas
- Tutoriais em vídeo
- **Chat integrado com gestor**
- **Sistema de mensagens de áudio**

---

## 🌐 Sites (sites*/criador*/design*)
**Criação e Gestão de Sites**

### Permissões
- ✅ Visualizar clientes que precisam de site
- ✅ Atualizar status de criação de sites
- ✅ Gerenciar links de sites
- ✅ Controlar pagamentos de sites
- ❌ Acesso limitado a dados de campanha
- ❌ **Sem acesso ao sistema de chat**

### Funcionalidades Principais
- Lista de sites pendentes
- Gerenciamento de status de sites
- Controle de pagamentos
- Upload de links finalizados

---

## 🔐 Matriz de Permissões

| Funcionalidade | Admin | Gestor | Vendedor | Cliente | Sites |
|---|---|---|---|---|---|
| Dashboard Global | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dashboard Gestor | ✅ | ✅ | ❌ | ❌ | ❌ |
| Dashboard Vendedor | ✅ | ❌ | ✅ | ❌ | ❌ |
| Dashboard Cliente | ✅ | ❌ | ❌ | ✅ | ❌ |
| Dashboard Sites | ✅ | ❌ | ❌ | ❌ | ✅ |
| Criar Cliente | ✅ | ✅* | ✅ | ❌ | ❌ |
| Editar Cliente | ✅ | ✅* | ❌ | ❌ | ❌ |
| Ver Todos Clientes | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver Próprios Clientes | ✅ | ✅ | ✅ | ✅ | ✅* |
| Gerenciar Gestores | ✅ | ❌ | ❌ | ❌ | ❌ |
| Auditoria | ✅ | ❌ | ❌ | ❌ | ❌ |
| Briefings | ✅ | ✅ | ❌ | ✅ | ❌ |
| Upload Materiais | ✅ | ✅ | ❌ | ✅ | ❌ |
| Comissões | ✅ | ✅ | ✅** | ❌ | ❌ |
| **Chat Sistema** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Mensagens Áudio** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Chat Overview** | ✅ | ❌ | ❌ | ❌ | ❌ |

*Apenas da própria gestoria  
**Apenas visualização  
***Apenas clientes que precisam de site

---

## 💬 Sistema de Comunicação

### **Chat em Tempo Real**
- **Conexão Direta**: Gestor ↔ Cliente
- **Mensagens Instantâneas**: Realtime via Supabase
- **Histórico Completo**: Todas as conversas salvas
- **Indicadores Visuais**: Status de leitura e mensagens novas

### **Mensagens de Áudio**
- **Gravação Direta**: Pelo navegador
- **Qualidade Otimizada**: Formato WebM/Opus
- **Upload Automático**: Para Supabase Storage
- **Reprodução Controlada**: Play/pause, duração

### **Permissões de Chat**
- **Admin**: Pode ver overview de todas as conversas
- **Gestor**: Chat apenas com clientes da sua gestoria
- **Cliente**: Chat apenas com seu gestor designado
- **Vendedor/Sites**: Sem acesso ao chat

---

[← Anterior: Visão Geral](./01-visao-geral.md) | [Próximo: Módulos do Sistema →](./03-modulos-sistema.md)
