
# 1. Visão Geral do Sistema

## 🎯 Propósito

O **Sistema de Gestão de Clientes e Campanhas** é uma plataforma completa para gerenciar todo o ciclo de vida de campanhas publicitárias, desde a captação de clientes até a entrega final e controle de comissões, incluindo comunicação em tempo real via chat integrado.

## 🏗️ Arquitetura

### Frontend
- **React** com TypeScript
- **Vite** como bundler
- **Tailwind CSS** + **shadcn/ui** para interface
- **React Router** para navegação
- **TanStack Query** para gerenciamento de estado
- **Realtime subscriptions** para atualizações em tempo real

### Backend
- **Supabase** (PostgreSQL + Auth + Realtime + Storage)
- **Row Level Security (RLS)** para segurança
- **Edge Functions** para lógicas específicas
- **Storage** para arquivos e materiais de áudio
- **Realtime** para chat e atualizações instantâneas

### Autenticação
- Sistema baseado em **email/senha**
- Controle de acesso por **domínio de email**
- Permissões granulares por **tipo de usuário**
- **Session management** com refresh automático

### Comunicação
- **Sistema de Chat Integrado** com mensagens em tempo real
- **Mensagens de Áudio** com gravação e reprodução
- **Upload de Materiais** via Supabase Storage
- **Notificações** em tempo real

## 🎯 Objetivos Principais

1. **Centralizar Gestão**: Unificar processos de vendas, campanhas e clientes
2. **Automatizar Fluxos**: Reduzir trabalho manual e erros humanos
3. **Controlar Qualidade**: Acompanhar status e prazos das campanhas
4. **Gerenciar Comissões**: Controle transparente de pagamentos
5. **Facilitar Comunicação**: Canal direto entre todos os envolvidos via chat
6. **Armazenar Materiais**: Gestão centralizada de arquivos e áudios

## 🔄 Fluxo Principal

```
Cliente Novo → Briefing → Criativo → Site → Agendamento → 
Configuração BM → Subida Campanha → Otimização → Saque
```

**Com Comunicação Integrada:**
- Chat em tempo real entre gestores e clientes
- Mensagens de áudio para explicações detalhadas
- Upload de materiais diretamente no chat
- Histórico completo de comunicações

## 📊 Métricas Importantes

- **Funil de Conversão**: Acompanhamento por etapa
- **Tempo por Status**: Controle de prazos
- **Performance por Gestor**: Análise de resultados
- **Comissões**: Controle financeiro completo
- **Engajamento**: Métricas de comunicação via chat

## 🛡️ Segurança

- **Autenticação obrigatória** para todos os acessos
- **Isolamento de dados** por gestor/cliente
- **Logs de auditoria** para todas as ações
- **Backup automático** dos dados críticos
- **Storage seguro** para arquivos sensíveis
- **RLS policies** para controle granular de acesso

## 🚀 Funcionalidades Avançadas

### Sistema de Chat
- Mensagens em tempo real
- Suporte a texto e áudio
- Histórico completo de conversas
- Indicadores de mensagens não lidas

### Sistema de Áudio
- Gravação direta no navegador
- Upload automático para Supabase Storage
- Reprodução com controles avançados
- Tratamento de erros robusto

### Storage e Materiais
- Upload de múltiplos formatos
- Organização automática por usuário
- URLs públicas seguras
- Controle de tamanho e tipo

---

[← Voltar ao Índice](./README.md) | [Próximo: Perfis de Usuário →](./02-perfis-usuario.md)
