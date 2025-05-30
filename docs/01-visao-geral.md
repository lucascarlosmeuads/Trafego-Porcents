
# 1. Visão Geral do Sistema

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

```
Cliente Novo → Briefing → Criativo → Site → Agendamento → 
Configuração BM → Subida Campanha → Otimização → Saque
```

## 📊 Métricas Importantes

- **Funil de Conversão**: Acompanhamento por etapa
- **Tempo por Status**: Controle de prazos
- **Performance por Gestor**: Análise de resultados
- **Comissões**: Controle financeiro completo

## 🛡️ Segurança

- **Autenticação obrigatória** para todos os acessos
- **Isolamento de dados** por gestor/cliente
- **Logs de auditoria** para todas as ações
- **Backup automático** dos dados críticos

---

[← Voltar ao Índice](./README.md) | [Próximo: Perfis de Usuário →](./02-perfis-usuario.md)
