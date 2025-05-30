
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

### Funcionalidades Exclusivas
- Dashboard administrativo
- Gestão de gestores
- Auditoria completa
- Importação de dados
- Configurações globais

---

## 👨‍💼 Gestor (@trafegoporcents.com)
**Gerenciamento de Equipe e Clientes**

### Permissões
- ✅ Visualizar clientes da sua gestoria
- ✅ Editar status e informações dos clientes
- ✅ Acessar métricas da equipe
- ✅ Gerenciar problemas e comentários
- ✅ Controlar comissões da equipe
- ❌ Não pode ver clientes de outros gestores

### Funcionalidades Principais
- Dashboard de gestão
- Lista de clientes ativos
- Gerenciamento de problemas
- Controle de comissões
- Métricas de performance

---

## 💼 Vendedor (vendedor*@trafegoporcents.com)
**Captação e Cadastro de Clientes**

### Permissões
- ✅ Cadastrar novos clientes
- ✅ Visualizar suas vendas
- ✅ Acompanhar métricas pessoais
- ✅ Criar login para clientes
- ❌ Não pode editar clientes existentes

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
- ❌ Não pode ver dados de outros clientes

### Funcionalidades Principais
- Painel de boas-vindas
- Formulário de briefing
- Upload de arquivos/materiais
- Registro de vendas
- Tutoriais em vídeo

---

## 🌐 Sites (sites*/criador*/design*)
**Criação e Gestão de Sites**

### Permissões
- ✅ Visualizar clientes que precisam de site
- ✅ Atualizar status de criação de sites
- ✅ Gerenciar links de sites
- ✅ Controlar pagamentos de sites
- ❌ Acesso limitado a dados de campanha

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

*Apenas da própria gestoria  
**Apenas visualização  
***Apenas clientes que precisam de site

---

[← Anterior: Visão Geral](./01-visao-geral.md) | [Próximo: Módulos do Sistema →](./03-modulos-sistema.md)
