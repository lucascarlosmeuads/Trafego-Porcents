
import { useState, useEffect } from 'react'
import { DocumentationSidebar } from './DocumentationSidebar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Book, Clock, FileText } from 'lucide-react'

interface DocumentationContent {
  id: string
  title: string
  content: string
  lastModified?: string
}

// Simulação do conteúdo dos arquivos de documentação
const documentationContent: Record<string, DocumentationContent> = {
  'readme': {
    id: 'readme',
    title: 'Sistema de Gestão de Clientes e Campanhas',
    content: `# Sistema de Gestão de Clientes e Campanhas

## 📋 Índice da Documentação

- **Visão Geral** - Introdução e arquitetura do sistema
- **Perfis de Usuário** - Tipos de usuário e permissões
- **Módulos do Sistema** - Funcionalidades principais
- **Base de Dados** - Estrutura do banco de dados
- **Fluxo de Trabalho** - Processos e estados

## 🚀 Acesso Rápido

### Para Usuários Finais
- Como fazer login
- Cadastrar um cliente
- Preencher briefing
- Gerenciar campanhas

### Para Desenvolvedores
- Configuração do ambiente
- Estrutura do código
- Deploy e produção

---

**Sistema desenvolvido para gestão completa de clientes, campanhas publicitárias e processos de vendas.**`
  },
  'visao-geral': {
    id: 'visao-geral',
    title: '1. Visão Geral do Sistema',
    content: `# 1. Visão Geral do Sistema

## 🎯 Propósito

O **Sistema de Gestão de Clientes e Campanhas** é uma plataforma completa para gerenciar todo o ciclo de vida de campanhas publicitárias, desde a captação de clientes até a entrega final e controle de comissões.

## 🏗️ Arquitetura

### Frontend
- **React** com TypeScript
- **Vite** como bundler
- **Tailwind CSS** + **shadcn/ui** para interface
- **React Router** para navegação
- **TanStack Query** para gerenciamento de estado

### Backend
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Row Level Security (RLS)** para segurança
- **Edge Functions** para lógicas específicas

### Autenticação
- Sistema baseado em **email/senha**
- Controle de acesso por **domínio de email**
- Permissões granulares por **tipo de usuário**

## 🎯 Objetivos Principais

1. **Centralizar Gestão**: Unificar processos de vendas, campanhas e clientes
2. **Automatizar Fluxos**: Reduzir trabalho manual e erros humanos
3. **Controlar Qualidade**: Acompanhar status e prazos das campanhas
4. **Gerenciar Comissões**: Controle transparente de pagamentos
5. **Facilitar Comunicação**: Canal direto entre todos os envolvidos

## 🔄 Fluxo Principal

\`\`\`
Cliente Novo → Briefing → Criativo → Site → Agendamento → 
Configuração BM → Subida Campanha → Otimização → Saque
\`\`\`

## 📊 Métricas Importantes

- **Funil de Conversão**: Acompanhamento por etapa
- **Tempo por Status**: Controle de prazos
- **Performance por Gestor**: Análise de resultados
- **Comissões**: Controle financeiro completo

## 🛡️ Segurança

- **Autenticação obrigatória** para todos os acessos
- **Isolamento de dados** por gestor/cliente
- **Logs de auditoria** para todas as ações
- **Backup automático** dos dados críticos`
  },
  'perfis-usuario': {
    id: 'perfis-usuario',
    title: '2. Perfis de Usuário e Permissões',
    content: `# 2. Perfis de Usuário e Permissões

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
- Upload de links finalizados`
  },
  'modulos-sistema': {
    id: 'modulos-sistema',
    title: '3. Módulos do Sistema',
    content: `# 3. Módulos do Sistema

## 📊 Dashboard e Métricas

### Dashboard Admin
- **Funil de Status**: Visualização dos clientes por etapa
- **Métricas Globais**: Total de clientes, campanhas ativas, receita
- **Performance por Gestor**: Ranking e estatísticas
- **Problemas Pendentes**: Alertas de clientes com issues

### Dashboard Gestor
- **Clientes Ativos**: Lista filtrada por gestor
- **Problemas da Equipe**: Clientes com problemas para resolver
- **Métricas da Gestoria**: Performance específica
- **Comissões Pendentes**: Controle financeiro

### Dashboard Vendedor
- **Vendas Pessoais**: Clientes cadastrados pelo vendedor
- **Métricas de Conversão**: Taxa de sucesso
- **Metas e Objetivos**: Acompanhamento de performance
- **Clientes Recentes**: Últimos cadastros

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

### Estados do Cliente
\`\`\`
Cliente Novo → Preenchimento Formulário → Brief → 
Criativo → Site → Agendamento → Configurando BM → 
Subindo Campanha → Otimização → Saque Pendente
\`\`\`

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

---

## 💰 Sistema de Comissões

### Controle Financeiro
- **Status de Pagamento**: Pendente, Pago, Cancelado
- **Valores Personalizados**: Por cliente ou padrão (R$ 60)
- **Solicitações de Saque**: Workflow de aprovação
- **Relatórios**: Comissões por período e gestor

### Workflow de Pagamento
\`\`\`
Campanha no Ar → Solicitação Saque → 
Aprovação Admin → Pagamento → Confirmação
\`\`\``
  },
  'base-dados': {
    id: 'base-dados',
    title: '4. Base de Dados',
    content: `# 4. Base de Dados

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza **PostgreSQL** via **Supabase** com **Row Level Security (RLS)** para garantir isolamento de dados.

---

## 📋 Tabelas Principais

### \`todos_clientes\` - Tabela Central
**Armazena todas as informações dos clientes e campanhas**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| \`id\` | bigint | Chave primária auto-incremento | ✅ |
| \`nome_cliente\` | text | Nome completo do cliente | ✅ |
| \`email_cliente\` | text | Email para login e contato | ✅ |
| \`telefone\` | text | Telefone com formatação | ✅ |
| \`vendedor\` | text | Nome do vendedor responsável | ✅ |
| \`email_gestor\` | text | Email do gestor responsável | ✅ |
| \`status_campanha\` | text | Estado atual da campanha | ✅ |
| \`data_venda\` | date | Data da venda inicial | ✅ |
| \`data_limite\` | text | Prazo calculado (15 dias) | Auto |
| \`valor_comissao\` | numeric | Valor da comissão (padrão R$ 60) | ✅ |
| \`comissao\` | text | Status: 'Pendente', 'Pago', 'Cancelado' | ✅ |
| \`site_status\` | text | Status de criação do site | ✅ |
| \`site_pago\` | boolean | Se o site foi pago | ✅ |
| \`descricao_problema\` | text | Descrição de problemas | ❌ |
| \`link_briefing\` | text | URL do briefing | ❌ |
| \`link_criativo\` | text | URL dos criativos | ❌ |
| \`link_site\` | text | URL do site finalizado | ❌ |
| \`numero_bm\` | text | Número do Business Manager | ❌ |
| \`created_at\` | timestamp | Data de criação (timezone BR) | Auto |

### \`briefings_cliente\` - Briefings Detalhados
**Informações específicas do briefing de cada cliente**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| \`id\` | uuid | Chave primária |
| \`email_cliente\` | text | Referência ao cliente |
| \`nome_produto\` | text | Nome do produto/serviço |
| \`descricao_resumida\` | text | Descrição do negócio |
| \`publico_alvo\` | text | Definição do público |
| \`diferencial\` | text | Diferenciais competitivos |
| \`investimento_diario\` | numeric | Valor de investimento diário |
| \`comissao_aceita\` | text | Aceite da comissão |
| \`observacoes_finais\` | text | Observações adicionais |
| \`liberar_edicao\` | boolean | Se permite edição |

---

## 🔐 Segurança e RLS

### Row Level Security
**Todas as tabelas possuem RLS ativado com políticas específicas:**

- **Isolamento por Gestor**: Gestores só veem seus clientes
- **Isolamento por Cliente**: Clientes só veem seus próprios dados
- **Admin Full Access**: Admins têm acesso total
- **Auditoria Completa**: Logs de todas as operações

### Políticas Principais
\`\`\`sql
-- Exemplo: Clientes só veem seus próprios dados
CREATE POLICY "cliente_acesso_proprio" ON todos_clientes
FOR ALL USING (email_cliente = auth.email());

-- Exemplo: Gestores veem apenas sua gestoria
CREATE POLICY "gestor_acesso_gestoria" ON todos_clientes
FOR ALL USING (email_gestor = auth.email());
\`\`\`

---

## 🔗 Relacionamentos

### Relacionamentos Principais
\`\`\`
gestores (1) ←→ (N) todos_clientes [email_gestor]
todos_clientes (1) ←→ (1) briefings_cliente [email_cliente]
todos_clientes (1) ←→ (N) vendas_cliente [email_cliente]
todos_clientes (1) ←→ (N) arquivos_cliente [email_cliente]
todos_clientes (1) ←→ (N) comentarios_cliente [cliente_id]
todos_clientes (1) ←→ (N) solicitacoes_saque [cliente_id]
\`\`\``
  },
  'fluxo-trabalho': {
    id: 'fluxo-trabalho',
    title: '5. Fluxo de Trabalho',
    content: `# 5. Fluxo de Trabalho

## 🔄 Jornada Completa do Cliente

### 1. **Captação e Cadastro**
**Responsável: Vendedor**

\`\`\`
Contato Inicial → Negociação → Fechamento → Cadastro no Sistema
\`\`\`

**Ações Realizadas:**
- Vendedor cadastra cliente com dados básicos
- Sistema gera login automático para o cliente
- Cliente recebe credenciais por email/WhatsApp
- Status inicial: **"Cliente Novo"**

**Dados Obrigatórios:**
- Nome completo
- Email válido
- Telefone com DDD
- Produto/Nicho
- Valor da comissão
- Gestor responsável

---

### 2. **Preenchimento do Briefing**
**Responsável: Cliente**

\`\`\`
Login do Cliente → Formulário de Briefing → Submissão → Aprovação
\`\`\`

**Status: "Preenchimento do Formulário" → "Brief"**

**Informações Coletadas:**
- Nome do produto/serviço
- Descrição detalhada do negócio
- Público-alvo específico
- Diferenciais competitivos
- Investimento diário pretendido
- Aceite da comissão
- Observações finais

**Validações:**
- Campos obrigatórios preenchidos
- Aprovação do gestor responsável
- Possibilidade de edição liberada pelo gestor

---

### 3. **Upload de Materiais**
**Responsável: Cliente**

\`\`\`
Acesso ao Painel → Upload de Arquivos → Organização → Aprovação
\`\`\`

**Materiais Aceitos:**
- **Imagens**: Logo, fotos de produtos, materiais gráficos
- **Vídeos**: Depoimentos, demonstrações, conteúdo promocional
- **Documentos**: Contratos, certificados, materiais informativos
- **Outros**: Qualquer material relevante para a campanha

**Controles:**
- Limite de tamanho por arquivo
- Tipos de arquivo permitidos
- Histórico completo de uploads
- Acesso restrito (cliente + gestor)

---

### 4. **Criação do Criativo**
**Responsável: Equipe de Criativos**

\`\`\`
Análise do Briefing → Criação dos Materiais → Aprovação → Entrega
\`\`\`

**Status: "Brief" → "Criativo"**

**Deliverables:**
- Peças gráficas para anúncios
- Textos publicitários (headlines, descrições)
- Vídeos promocionais (se aplicável)
- Materiais para landing page
- Configurações de segmentação

**Processo:**
1. Equipe analisa briefing e materiais
2. Criação dos criativos
3. Revisão interna
4. Upload no sistema (link_criativo)
5. Mudança de status pelo gestor

---

## ⚠️ Estados Especiais

### **Problema**
**Quando:** Qualquer issue que impeça a progressão normal

**Ações:**
- Documentação detalhada do problema
- Notificação para gestor e admin
- Prazo para resolução
- Acompanhamento específico

### **Cliente Sumiu**
**Quando:** Cliente não responde por período prolongado

**Ações:**
- Tentativas de contato documentadas
- Prazo para retorno
- Possível reagendamento ou cancelamento

### **Reembolso**
**Quando:** Solicitação de devolução do investimento

**Ações:**
- Análise do caso
- Aprovação da diretoria
- Processamento do reembolso
- Documentação completa

### **Urgente**
**Quando:** Casos que precisam de prioridade máxima

**Ações:**
- Atendimento prioritário
- Recursos dedicados
- Acompanhamento intensivo
- Relatórios específicos

---

## 📊 Controle de Prazos

### **Cálculo Automático**
- **Data Limite**: Sempre 15 dias corridos da data de venda
- **Alertas**: Sistema notifica quando se aproxima do prazo
- **Semáforo**: Verde (no prazo), Amarelo (próximo), Vermelho (atrasado)

### **Gestão de SLA**
- **Briefing**: 3 dias para preenchimento
- **Criativo**: 5 dias para entrega
- **Site**: 7 dias para finalização
- **Agendamento**: 2 dias para contato
- **BM**: 3 dias para configuração
- **Subida**: 2 dias para publicação`
  }
}

export function DocumentationViewer() {
  const [selectedDoc, setSelectedDoc] = useState('readme')
  const [currentDoc, setCurrentDoc] = useState<DocumentationContent | null>(null)

  useEffect(() => {
    const doc = documentationContent[selectedDoc]
    if (doc) {
      setCurrentDoc(doc)
    }
  }, [selectedDoc])

  const formatMarkdownContent = (content: string) => {
    // Converter markdown básico para HTML simples
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 text-foreground">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-4 mt-8 text-foreground border-b pb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-3 mt-6 text-foreground">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 mb-1">$1. $2</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^([^<].*$)/gm, '<p class="mb-4">$1</p>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$1</code></pre>')
  }

  return (
    <div className="flex h-full bg-background">
      <DocumentationSidebar
        selectedDoc={selectedDoc}
        onDocSelect={setSelectedDoc}
      />
      
      <div className="flex-1 flex flex-col">
        {currentDoc && (
          <>
            <div className="bg-card border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h1 className="text-xl font-semibold">{currentDoc.title}</h1>
                </div>
                <Badge variant="secondary">Documentação</Badge>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Atualizado automaticamente</span>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto p-6">
                <Card className="p-8">
                  <div 
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMarkdownContent(currentDoc.content) 
                    }}
                  />
                </Card>
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  )
}
