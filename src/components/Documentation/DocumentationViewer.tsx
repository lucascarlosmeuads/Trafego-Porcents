import { useState, useEffect } from 'react'
import { DocumentationSidebar } from './DocumentationSidebar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, FileText } from 'lucide-react'

interface DocumentationContent {
  id: string
  title: string
  content: string
  lastModified?: string
}

// Conteúdo atualizado da documentação
const documentationContent: Record<string, DocumentationContent> = {
  'readme': {
    id: 'readme',
    title: 'Sistema de Gestão de Clientes e Campanhas',
    content: `# Sistema de Gestão de Clientes e Campanhas

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

### 📖 Manuais de Usuário
- **Manual Completo** - Guias detalhados por perfil
- **Guia Técnico** - Desenvolvimento e manutenção

## 🚀 Acesso Rápido

### Para Usuários Finais
- Como fazer login
- Cadastrar um cliente
- Preencher briefing
- Gerenciar campanhas
- **🆕 Usar o sistema de chat**
- **🆕 Gravar mensagens de áudio**

### Para Desenvolvedores
- Configuração do ambiente
- Estrutura do código
- Deploy e produção
- **🆕 Configuração do Storage**
- **🆕 Troubleshooting avançado**

## 🎯 Principais Funcionalidades

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

### Integrações
- **WebRTC** para gravação de áudio
- **Supabase Storage** para arquivos
- **Real-time subscriptions** para chat

**Sistema desenvolvido para gestão completa de clientes, campanhas publicitárias e processos de vendas.**`
  },
  'visao-geral': {
    id: 'visao-geral',
    title: '1. Visão Geral do Sistema',
    content: `# 1. Visão Geral do Sistema

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

\`\`\`
Cliente Novo → Briefing → Criativo → Site → Agendamento → 
Configuração BM → Subida Campanha → Otimização → Saque
\`\`\`

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
- Controle de tamanho e tipo`
  },
  'sistema-chat': {
    id: 'sistema-chat',
    title: '6. Sistema de Chat',
    content: `# 6. Sistema de Chat

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

#### 🔴 Admin
- **Acesso**: Visão geral de todas as conversas
- **Funcionalidades**:
  - Monitorar todas as conversas ativas
  - Ver estatísticas de uso do chat
  - Identificar conversas com problemas
  - Acessar histórico completo

#### 🟡 Gestor
- **Acesso**: Chat com clientes da sua gestoria
- **Funcionalidades**:
  - Conversar diretamente com clientes
  - Enviar/receber mensagens de áudio
  - Ver histórico completo da conversa
  - Indicadores de mensagens não lidas

#### 🟢 Cliente
- **Acesso**: Chat apenas com seu gestor designado
- **Funcionalidades**:
  - Conversar com o gestor responsável
  - Enviar mensagens de áudio
  - Receber orientações em tempo real
  - Acompanhar status via chat

## 📱 Interface do Chat

### Funcionalidades do Chat
- **Mensagens de Texto**: Comunicação escrita básica
- **Mensagens de Áudio**: Gravação e reprodução de áudios
- **Indicadores de Status**: Lida/não lida, online/offline
- **Notificações**: Alertas para novas mensagens

### Indicadores Visuais
- **✅ Mensagem lida**: Cor diferenciada
- **⚪ Mensagem não lida**: Destaque visual
- **🎵 Ícone de áudio**: Para mensagens de áudio
- **⏰ Timestamp**: Horário de envio
- **👤 Avatar**: Identificação do remetente`
  },
  'sistema-audio': {
    id: 'sistema-audio',
    title: '7. Sistema de Áudio',
    content: `# 7. Sistema de Áudio

## 🎵 Visão Geral

O Sistema de Áudio permite gravação, upload, armazenamento e reprodução de mensagens de áudio dentro do sistema de chat, proporcionando uma comunicação mais rica e eficiente entre gestores e clientes.

## 🎙️ Gravação de Áudio

### Tecnologia Utilizada
- **WebRTC**: API nativa do navegador para captura de áudio
- **MediaRecorder**: Interface para gravação de mídia
- **getUserMedia**: Acesso ao microfone do usuário

### Configurações de Gravação
\`\`\`typescript
const audioConstraints = {
  audio: {
    echoCancellation: true,      // Cancelamento de eco
    noiseSuppression: true,      // Supressão de ruído
    sampleRate: 44100,          // Taxa de amostragem
    channelCount: 1,            // Mono (economia de espaço)
    autoGainControl: true       // Controle automático de ganho
  }
}

const mediaRecorderOptions = {
  mimeType: 'audio/webm;codecs=opus',  // Formato preferido
  audioBitsPerSecond: 128000           // Qualidade balanceada
}
\`\`\`

### Formatos Suportados
1. **Preferido**: \`audio/webm;codecs=opus\`
2. **Fallback**: \`audio/webm\`
3. **Alternativo**: \`audio/mp4\`
4. **Último recurso**: Formato padrão do navegador

### Processo de Gravação
\`\`\`
1. Solicitar Permissão → 2. Configurar MediaRecorder → 3. Iniciar Gravação
         ↓                         ↓                         ↓
4. Capturar Chunks → 5. Parar Gravação → 6. Processar Blob → 7. Preview/Upload
\`\`\`

## 💾 Armazenamento

### Supabase Storage
- **Bucket**: \`chat-audios\`
- **Público**: Sim (necessário para reprodução)
- **Organização**: \`{user_id}/audio_{timestamp}.webm\`
- **Tamanho Máximo**: 10MB por arquivo

## 🔊 Reprodução de Áudio

### Interface de Reprodução
- **Play/Pause**: Controles básicos de reprodução
- **Duração**: Exibição do tempo total
- **Tratamento de Erros**: Fallbacks para problemas de rede
- **Cache Inteligente**: Otimização de carregamento

### Estados da Interface
- **Idle**: Botão "Gravar" disponível
- **Recording**: Indicador visual + timer + botão "Parar"
- **Recorded**: Preview do áudio + opções (Play/Delete/Send)
- **Uploading**: Indicador de progresso
- **Error**: Mensagem de erro + opção de retry`
  },
  'supabase-storage': {
    id: 'supabase-storage',
    title: '8. Supabase Storage',
    content: `# 8. Supabase Storage

## 📁 Visão Geral

O Supabase Storage é utilizado para armazenar e gerenciar todos os arquivos do sistema, incluindo mensagens de áudio, materiais de clientes, assets de campanhas e outros documentos importantes.

## 🗂️ Buckets Configurados

### \`chat-audios\` (Ativo)
**Armazenamento de mensagens de áudio do chat**

\`\`\`sql
-- Configuração do bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-audios', 'chat-audios', true);
\`\`\`

**Características:**
- **Público**: ✅ Sim (necessário para reprodução direta)
- **Tamanho Máximo**: 10MB por arquivo
- **Formatos Aceitos**: WebM, MP4, WAV, OGG
- **Organização**: \`{user_id}/audio_{timestamp}.webm\`
- **Retenção**: Indefinida (pode ser configurada limpeza automática)

### \`client-materials\` (Planejado)
**Materiais enviados pelos clientes**

**Características:**
- **Público**: ❌ Não (acesso controlado)
- **Tamanho Máximo**: 50MB por arquivo
- **Formatos Aceitos**: PNG, JPG, PDF, MP4, ZIP, etc.
- **Organização**: \`{cliente_id}/{categoria}/{arquivo}\`
- **Retenção**: Permanente

## 🔐 Políticas de Segurança (RLS)

### Políticas para \`chat-audios\`

#### Upload de Áudios
\`\`\`sql
CREATE POLICY "Allow authenticated users to upload audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-audios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
\`\`\`

#### Leitura Pública
\`\`\`sql
CREATE POLICY "Allow public read access to audio files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-audios');
\`\`\`

## 📤 Upload de Arquivos

### Implementação Básica
\`\`\`typescript
const uploadFile = async (
  file: File, 
  bucket: string, 
  path: string
): Promise<string> => {
  // Validar arquivo
  validateFile(file);
  
  // Upload para o Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false, // Não sobrescrever arquivos existentes
      contentType: file.type
    });
    
  if (error) {
    throw new Error(\`Erro no upload: \${error.message}\`);
  }
  
  // Retornar URL pública (se bucket for público)
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return publicUrl;
};
\`\`\`

## 🧹 Gestão de Arquivos

### Listagem de Arquivos
- Listar arquivos de um bucket específico
- Filtrar por pasta/usuário
- Ordenação por data/tamanho
- Paginação para performance

### Deletar Arquivos
- Remoção individual ou em lote
- Verificação de permissões
- Cleanup automático de arquivos antigos`
  },
  'troubleshooting': {
    id: 'troubleshooting',
    title: '9. Troubleshooting',
    content: `# 9. Troubleshooting

## 🚨 Problemas Comuns e Soluções

### **Problemas de Login e Autenticação**

#### ❌ "Email ou senha incorretos"
**Possíveis Causas:**
- Credenciais digitadas incorretamente
- Usuário não existe no sistema
- Senha foi alterada recentemente

**Soluções:**
1. Verificar se email está escrito corretamente
2. Usar "Esqueci minha senha" para redefinir
3. Verificar se usuário foi criado no sistema
4. Para admins: verificar na tabela \`auth.users\` do Supabase

#### ❌ "Usuário não autorizado"
**Possíveis Causas:**
- Email não está cadastrado em nenhuma tabela
- Domínio do email não é reconhecido pelo sistema
- Usuário foi desativado

**Soluções:**
1. **Para Gestores**: Verificar se está cadastrado na tabela \`gestores\` com \`ativo = true\`
2. **Para Clientes**: Verificar se está na tabela \`todos_clientes\`
3. **Para Vendedores**: Email deve seguir padrão \`vendedor*@trafegoporcents.com\`
4. **Para Sites**: Email deve conter palavras-chave como 'criador', 'site', 'design'

### **Problemas com Chat e Mensagens**

#### ❌ "Mensagens não aparecem em tempo real"
**Possíveis Causas:**
- Problemas com Supabase Realtime
- Subscription não configurada corretamente
- RLS bloqueando acesso às mensagens

**Soluções:**
\`\`\`typescript
// 1. Verificar se realtime está habilitado
const subscription = supabase
  .channel('chat-mensagens')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_mensagens',
    filter: \`email_gestor=eq.\${email}\`
  }, (payload) => {
    console.log('📥 Nova mensagem recebida:', payload);
  })
  .subscribe((status) => {
    console.log('🔗 Status da subscription:', status);
  });
\`\`\`

#### ❌ "Erro ao enviar mensagem"
**Possíveis Causas:**
- RLS impedindo inserção
- Campos obrigatórios não preenchidos
- Problema de conectividade

### **Problemas com Áudio**

#### ❌ "Não consegue gravar áudio"
**Possíveis Causas:**
- Permissão de microfone negada
- Microfone não encontrado
- Navegador não suporta WebRTC

**Soluções:**
\`\`\`typescript
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      } 
    });
    console.log('✅ Microfone acessado com sucesso');
  } catch (error) {
    switch (error.name) {
      case 'NotAllowedError':
        alert('Permita o acesso ao microfone nas configurações do navegador');
        break;
      case 'NotFoundError':
        alert('Nenhum microfone foi encontrado no dispositivo');
        break;
    }
  }
};
\`\`\`

#### ❌ "Áudio não reproduz"
**Possíveis Causas:**
- URL do áudio inválida
- Arquivo corrompido
- Problemas de CORS
- Bucket não público

### **Problemas com Storage**

#### ❌ "Upload de áudio falha"
**Possíveis Causas:**
- Arquivo muito grande
- RLS impedindo upload
- Problema de conectividade
- Bucket não configurado

## 📊 Monitoramento e Logs

### Como Ativar Logs Detalhados
\`\`\`typescript
// Adicionar logs nos hooks
console.log('🔍 [useAuth] Verificando tipo de usuário:', email);
console.log('💬 [useChatMessages] Nova mensagem:', mensagem);
console.log('🎵 [AudioRecorder] Upload de áudio:', audioUrl);
\`\`\`

### Verificar Logs do Supabase
1. Acessar Dashboard do Supabase
2. Ir em **Logs** > **API**
3. Filtrar por timestamp do problema
4. Procurar por status 400, 401, 403, 500

## 📞 Contatos para Suporte

### Suporte Técnico
- **Email**: suporte.tecnico@empresa.com
- **WhatsApp**: (11) 99999-9999
- **Horário**: Segunda a Sexta, 8h às 18h

### Informações para Reportar Problemas
Sempre incluir:
- **URL da página** onde ocorreu o problema
- **Email do usuário** afetado
- **Horário exato** do problema
- **Screenshots** da tela e console (F12)
- **Mensagem de erro** completa
- **Tipo de dispositivo** (desktop/mobile)
- **Navegador** e versão`
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
                <Badge variant="secondary">Documentação v2.0.0</Badge>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Atualizado: Dezembro 2024</span>
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
