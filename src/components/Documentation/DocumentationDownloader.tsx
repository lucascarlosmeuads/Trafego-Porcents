
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/sonner'

// Lista completa dos documentos
const documentationFiles = [
  { id: 'readme', title: 'Índice Geral', path: 'README.md' },
  { id: 'visao-geral', title: '1. Visão Geral', path: '01-visao-geral.md' },
  { id: 'perfis-usuario', title: '2. Perfis de Usuário', path: '02-perfis-usuario.md' },
  { id: 'modulos-sistema', title: '3. Módulos do Sistema', path: '03-modulos-sistema.md' },
  { id: 'base-dados', title: '4. Base de Dados', path: '04-base-dados.md' },
  { id: 'fluxo-trabalho', title: '5. Fluxo de Trabalho', path: '05-fluxo-trabalho.md' },
  { id: 'sistema-chat', title: '6. Sistema de Chat', path: '06-sistema-chat.md' },
  { id: 'sistema-audio', title: '7. Sistema de Áudio', path: '07-sistema-audio.md' },
  { id: 'supabase-storage', title: '8. Supabase Storage', path: '08-supabase-storage.md' },
  { id: 'troubleshooting', title: '9. Troubleshooting', path: '09-troubleshooting.md' },
  { id: 'manual-usuario', title: 'Manual do Usuário', path: '06-manual-usuario.md' },
  { id: 'guia-tecnico', title: 'Guia Técnico', path: '07-guia-tecnico.md' }
];

// Conteúdo completo da documentação (seria melhor buscar dos arquivos reais)
const documentationContent: Record<string, string> = {
  'readme': `# Sistema de Gestão de Clientes e Campanhas

## 📋 Índice da Documentação

### 📚 Documentação Principal
- **1. Visão Geral** - Introdução e arquitetura do sistema
- **2. Perfis de Usuário** - Tipos de usuário e permissões
- **3. Módulos do Sistema** - Funcionalidades principais
- **4. Base de Dados** - Estrutura do banco de dados
- **5. Fluxo de Trabalho** - Processos e estados

### 🆕 Funcionalidades Avançadas
- **6. Sistema de Chat** - Comunicação em tempo real
- **7. Sistema de Áudio** - Gravação e reprodução de áudios
- **8. Supabase Storage** - Gestão de arquivos
- **9. Troubleshooting** - Problemas comuns e soluções

## 🚀 Principais Funcionalidades

### ✅ Funcionalidades Implementadas
- **Gestão Completa de Clientes** - CRUD completo com filtros avançados
- **Sistema de Campanhas** - 15+ status diferentes e workflow completo
- **Controle de Comissões** - Gestão financeira transparente
- **Dashboard Multi-perfil** - Visões específicas por tipo de usuário
- **Briefings Detalhados** - Formulários estruturados para coleta de dados
- **Upload de Materiais** - Sistema de arquivos integrado
- **🆕 Chat em Tempo Real** - Comunicação instantânea gestor-cliente
- **🆕 Mensagens de Áudio** - Gravação e reprodução de áudios
- **🆕 Supabase Storage** - Armazenamento seguro de arquivos
- **🆕 Realtime Updates** - Atualizações instantâneas via WebSocket

## 🏗️ Arquitetura Técnica

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** + **shadcn/ui** para interface
- **TanStack Query** para estado e cache
- **React Router** para navegação

### Backend
- **Supabase** (PostgreSQL + Auth + Realtime + Storage)
- **Row Level Security (RLS)** para segurança
- **Edge Functions** para lógicas serverless
- **Realtime** para comunicação instantânea

**Sistema desenvolvido para gestão completa de clientes, campanhas publicitárias e processos de vendas.**`,

  'visao-geral': `# 1. Visão Geral do Sistema

## 🎯 Propósito
O Sistema de Gestão de Clientes e Campanhas é uma plataforma completa para gerenciar todo o ciclo de vida de campanhas publicitárias, desde a captação de clientes até a entrega final e controle de comissões, incluindo comunicação em tempo real via chat integrado.

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
6. **Armazenar Materiais**: Gestão centralizada de arquivos e áudios`,

  'sistema-chat': `# 6. Sistema de Chat

## 💬 Visão Geral
O Sistema de Chat é uma funcionalidade integrada que permite comunicação em tempo real entre gestores e clientes, incluindo suporte a mensagens de texto e áudio, com todas as mensagens salvas no banco de dados.

## 🏗️ Arquitetura do Chat

### Componentes Principais
- **ChatInterface**: Interface principal do chat
- **MessageInput**: Campo de entrada de mensagens
- **MessageItem**: Exibição individual de mensagens
- **AudioRecorder**: Gravação de mensagens de áudio
- **AdminChatOverview**: Visão geral para administradores

### Tecnologias Utilizadas
- **Supabase Realtime**: Para mensagens instantâneas
- **Supabase Storage**: Para armazenamento de áudios
- **WebRTC**: Para gravação de áudio no navegador
- **TanStack Query**: Para cache e sincronização

## 👥 Permissões e Acesso

### Perfis com Acesso ao Chat
- **Admin**: Visão geral de todas as conversas
- **Gestor**: Chat com clientes da sua gestoria
- **Cliente**: Chat apenas com seu gestor designado

### Funcionalidades do Chat
- **Mensagens de Texto**: Comunicação escrita básica
- **Mensagens de Áudio**: Gravação e reprodução de áudios
- **Indicadores de Status**: Lida/não lida, online/offline
- **Notificações**: Alertas para novas mensagens`,

  'sistema-audio': `# 7. Sistema de Áudio

## 🎵 Visão Geral
O Sistema de Áudio permite gravação, upload, armazenamento e reprodução de mensagens de áudio dentro do sistema de chat, proporcionando uma comunicação mais rica e eficiente entre gestores e clientes.

## 🎙️ Gravação de Áudio

### Tecnologia Utilizada
- **WebRTC**: API nativa do navegador para captura de áudio
- **MediaRecorder**: Interface para gravação de mídia
- **getUserMedia**: Acesso ao microfone do usuário

### Configurações de Gravação
- **Formato**: audio/webm;codecs=opus
- **Qualidade**: 128kbps
- **Cancelamento de eco**: Ativado
- **Supressão de ruído**: Ativado
- **Taxa de amostragem**: 44.1kHz

### Processo de Gravação
1. Solicitar Permissão
2. Configurar MediaRecorder
3. Iniciar Gravação
4. Capturar Chunks
5. Parar Gravação
6. Processar Blob
7. Preview/Upload

## 💾 Armazenamento
- **Bucket**: chat-audios
- **Público**: Sim (necessário para reprodução)
- **Organização**: {user_id}/audio_{timestamp}.webm
- **Tamanho Máximo**: 10MB por arquivo`,

  'supabase-storage': `# 8. Supabase Storage

## 📁 Visão Geral
O Supabase Storage é utilizado para armazenar e gerenciar todos os arquivos do sistema, incluindo mensagens de áudio, materiais de clientes, assets de campanhas e outros documentos importantes.

## 🗂️ Buckets Configurados

### chat-audios (Ativo)
**Armazenamento de mensagens de áudio do chat**
- **Público**: ✅ Sim (necessário para reprodução direta)
- **Tamanho Máximo**: 10MB por arquivo
- **Formatos Aceitos**: WebM, MP4, WAV, OGG
- **Organização**: {user_id}/audio_{timestamp}.webm

### client-materials (Planejado)
**Materiais enviados pelos clientes**
- **Público**: ❌ Não (acesso controlado)
- **Tamanho Máximo**: 50MB por arquivo
- **Formatos Aceitos**: PNG, JPG, PDF, MP4, ZIP, etc.
- **Organização**: {cliente_id}/{categoria}/{arquivo}

## 🔐 Políticas de Segurança (RLS)

### Políticas para chat-audios
- Upload de áudios por usuários autenticados
- Leitura pública para reprodução
- Listagem de próprios arquivos
- Deletar próprios arquivos`,

  'troubleshooting': `# 9. Troubleshooting

## 🚨 Problemas Comuns e Soluções

### Problemas de Login e Autenticação
- Email ou senha incorretos
- Usuário não autorizado
- Infinite loading na tela de login

### Problemas com Chat e Mensagens
- Mensagens não aparecem em tempo real
- Erro ao enviar mensagem
- Chat não carrega conversas anteriores

### Problemas com Áudio
- Não consegue gravar áudio
- Áudio não reproduz
- Upload de áudio falha

### Problemas com Storage
- Bucket não encontrado
- Políticas RLS bloqueando acesso

### Problemas de Performance
- Sistema muito lento
- Mensagens de chat lentas

## 📊 Monitoramento e Logs
- Como ativar logs detalhados
- Verificar logs do Supabase
- Logs importantes para acompanhar

## 📞 Contatos para Suporte
- Suporte Técnico
- Escalação de Problemas
- Informações para Reportar Problemas`
};

export function DocumentationDownloader() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateCompleteDocumentation = () => {
    const currentDate = new Date().toLocaleDateString('pt-BR')
    const timestamp = new Date().toISOString()
    
    let completeDoc = `# DOCUMENTAÇÃO COMPLETA - SISTEMA DE GESTÃO DE CLIENTES E CAMPANHAS
Gerado em: ${currentDate}
Timestamp: ${timestamp}
Versão: 2.0.0 (com Chat e Áudio)

=============================================================================

`

    // Adicionar cada documento
    documentationFiles.forEach((file, index) => {
      const content = documentationContent[file.id] || `# ${file.title}\n\nConteúdo não disponível.`
      
      completeDoc += `
${'='.repeat(80)}
${file.title.toUpperCase()}
${'='.repeat(80)}

${content}

${'='.repeat(80)}

`
    })

    // Adicionar informações finais
    completeDoc += `
=============================================================================
INFORMAÇÕES ADICIONAIS PARA IA/GPT
=============================================================================

CONTEXTO DO SISTEMA:
- Sistema web desenvolvido em React + TypeScript
- Backend: Supabase (PostgreSQL + Auth + Realtime + Storage)
- Frontend: Tailwind CSS + shadcn/ui
- Funcionalidades principais: Gestão de clientes, campanhas, chat em tempo real, áudios

PERFIS DE USUÁRIO:
1. Admin (@admin) - Acesso total
2. Gestor (@trafegoporcents.com) - Gerencia clientes da gestoria + chat
3. Vendedor (vendedor*@trafegoporcents.com) - Cadastra novos clientes
4. Cliente (email individual) - Preenche briefing + chat com gestor
5. Sites (sites*/criador*/design*) - Gerencia criação de sites

STATUS DE CAMPANHA (15 estados):
Cliente Novo → Preenchimento do Formulário → Brief → Criativo → Site → 
Agendamento → Configurando BM → Subindo Campanha → Otimização → Saque Pendente

FUNCIONALIDADES PRINCIPAIS:
- Dashboard específico por perfil
- CRUD completo de clientes com RLS
- Sistema de chat em tempo real (gestor ↔ cliente)
- Mensagens de áudio (gravação/reprodução)
- Upload de materiais via Supabase Storage
- Controle de comissões e saques
- Realtime updates via WebSocket

TECNOLOGIAS CHAVE:
- Supabase Realtime para chat instantâneo
- WebRTC para gravação de áudio
- Supabase Storage com buckets públicos/privados
- Row Level Security (RLS) em todas as tabelas
- TanStack Query para cache e sincronização

ESTRUTURA DO BANCO:
- todos_clientes (tabela principal)
- chat_mensagens (sistema de chat)
- briefings_cliente, vendas_cliente, arquivos_cliente
- gestores, comentarios_cliente, solicitacoes_saque
- Storage: bucket 'chat-audios' (público para reprodução)

ARQUITETURA DE SEGURANÇA:
- RLS isolando dados por gestor/cliente
- Policies específicas para cada perfil
- Storage com políticas granulares
- Autenticação obrigatória em todo o sistema

Este sistema é uma plataforma completa de gestão comercial com foco em 
campanhas publicitárias, incluindo comunicação em tempo real e controle 
financeiro de comissões.

=============================================================================
FIM DA DOCUMENTAÇÃO
Gerado automaticamente em ${timestamp}
=============================================================================
`

    return completeDoc
  }

  const downloadDocumentation = () => {
    setIsGenerating(true)
    
    try {
      const completeDoc = generateCompleteDocumentation()
      
      // Criar blob e fazer download
      const blob = new Blob([completeDoc], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `documentacao-completa-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      toast.success('Documentação baixada com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar documentação:', error)
      toast.error('Erro ao gerar documentação')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center gap-3 mb-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-medium">Download Completo</h3>
          <p className="text-sm text-muted-foreground">
            Baixe toda a documentação em arquivo TXT
          </p>
        </div>
      </div>
      
      <Button
        onClick={downloadDocumentation}
        disabled={isGenerating}
        className="w-full"
        variant="outline"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando arquivo...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Baixar Documentação Completa (.txt)
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Ideal para consulta offline ou para uso com IA/GPT
      </p>
    </div>
  )
}
