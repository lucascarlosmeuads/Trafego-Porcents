
# 6. Sistema de Chat

## 💬 Visão Geral

O Sistema de Chat é uma funcionalidade integrada que permite comunicação em tempo real entre gestores e clientes, incluindo suporte a mensagens de texto e áudio, com todas as mensagens salvas no banco de dados.

---

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

---

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

#### ❌ Perfis Sem Acesso
- **Vendedores**: Não têm acesso ao sistema de chat
- **Equipe de Sites**: Não têm acesso ao sistema de chat

---

## 📱 Interface do Chat

### Layout Principal
```
┌─────────────────────────────────────┐
│ Header: Nome do Cliente/Gestor      │
├─────────────────────────────────────┤
│                                     │
│ Área de Mensagens                   │
│ ┌─────────────────────────────────┐ │
│ │ Mensagem do Gestor              │ │
│ │ [15:30]                         │ │
│ └─────────────────────────────────┘ │
│       ┌─────────────────────────────┐│
│       │              Mensagem Cliente││
│       │                     [15:32] ││
│       └─────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│ Campo de Entrada + Gravação Áudio   │
└─────────────────────────────────────┘
```

### Indicadores Visuais
- **✅ Mensagem lida**: Cor diferenciada
- **⚪ Mensagem não lida**: Destaque visual
- **🎵 Ícone de áudio**: Para mensagens de áudio
- **⏰ Timestamp**: Horário de envio
- **👤 Avatar**: Identificação do remetente

---

## 🎤 Sistema de Mensagens de Áudio

### Gravação de Áudio

#### Processo de Gravação
1. **Permissão**: Solicita acesso ao microfone
2. **Configuração**: WebRTC com configurações otimizadas
3. **Gravação**: Formato WebM com codec Opus
4. **Preview**: Possibilidade de ouvir antes de enviar
5. **Upload**: Envio automático para Supabase Storage

#### Configurações Técnicas
```typescript
const mediaRecorderOptions = {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 128000
}

const audioConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  }
}
```

### Reprodução de Áudio

#### Controles de Reprodução
- **▶️ Play**: Iniciar reprodução
- **⏸️ Pause**: Pausar reprodução
- **⏹️ Stop**: Parar e voltar ao início
- **🔄 Retry**: Tentar novamente em caso de erro

#### Tratamento de Erros
- **Erro de Rede**: Indicador visual e botão de retry
- **Arquivo Corrompido**: Mensagem de erro específica
- **Permissões**: Orientação sobre configurações do navegador

---

## 💾 Armazenamento e Dados

### Tabela `chat_mensagens`
```sql
CREATE TABLE chat_mensagens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email_gestor text NOT NULL,
  email_cliente text NOT NULL,
  cliente_id text NOT NULL,
  remetente text NOT NULL, -- 'gestor' ou 'cliente'
  conteudo text NOT NULL,  -- URL do áudio ou texto da mensagem
  tipo text NOT NULL,      -- 'texto' ou 'audio'
  status_campanha text,
  lida boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Storage `chat-audios`
```
Estrutura do Bucket:
chat-audios/
├── {user_id}/
│   ├── audio_1703123456789.webm
│   ├── audio_1703123567890.webm
│   └── ...
```

### Políticas de Segurança
```sql
-- Upload de áudios por usuários autenticados
CREATE POLICY "Allow authenticated upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat-audios');

-- Leitura pública para reprodução
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'chat-audios');
```

---

## ⚡ Funcionalidades Realtime

### Supabase Realtime
```typescript
// Subscription para novas mensagens
const subscription = supabase
  .channel('chat-mensagens')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_mensagens',
    filter: `email_gestor=eq.${gestorEmail}`
  }, (payload) => {
    // Atualizar interface com nova mensagem
    handleNewMessage(payload.new);
  })
  .subscribe();
```

### Atualizações Instantâneas
- **Nova Mensagem**: Aparece imediatamente na tela
- **Status de Leitura**: Atualização em tempo real
- **Indicadores**: Typing indicators (futuro)
- **Presence**: Status online/offline (futuro)

---

## 🔧 Implementação Técnica

### Hook Principal: `useChatMessages`
```typescript
export function useChatMessages(clienteId: string) {
  const [mensagens, setMensagens] = useState<ChatMensagem[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar mensagens existentes
  const fetchMensagens = useCallback(async () => {
    // Implementação da busca
  }, [clienteId]);

  // Subscription para novas mensagens
  useEffect(() => {
    const subscription = supabase
      .channel(`chat-${clienteId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public', 
        table: 'chat_mensagens',
        filter: `cliente_id=eq.${clienteId}`
      }, handleNewMessage)
      .subscribe();

    return () => subscription.unsubscribe();
  }, [clienteId]);

  return { mensagens, loading, enviarMensagem };
}
```

### Componente de Gravação: `AudioRecorder`
```typescript
export function AudioRecorder({ onAudioReady }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const startRecording = async () => {
    // Implementação da gravação
  };
  
  const uploadAudio = async () => {
    // Upload para Supabase Storage
  };

  return (
    // Interface de gravação
  );
}
```

---

## 📊 Métricas e Monitoramento

### Métricas Disponíveis
- **Mensagens por Dia**: Volume de comunicação
- **Tempo de Resposta**: Média de resposta dos gestores
- **Uso de Áudio**: Porcentagem de mensagens de áudio
- **Conversas Ativas**: Número de chats ativos
- **Taxa de Engajamento**: Frequência de uso por cliente

### Dashboard Admin - Chat Overview
```
┌─────────────────────────────────────┐
│ 📊 Estatísticas Gerais              │
├─────────────────────────────────────┤
│ Total de Conversas: 45              │
│ Mensagens Hoje: 234                 │
│ Mensagens de Áudio: 89 (38%)        │
│ Tempo Médio de Resposta: 1h 23m     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🔥 Conversas Mais Ativas            │
├─────────────────────────────────────┤
│ João Silva - 12 mensagens hoje      │
│ Maria Santos - 8 mensagens hoje     │
│ Pedro Costa - 6 mensagens hoje      │
└─────────────────────────────────────┘
```

---

## 🚨 Tratamento de Erros

### Erros Comuns e Soluções

#### Gravação de Áudio
```typescript
// Erro: Permissão negada para microfone
if (error.name === 'NotAllowedError') {
  toast.error('Permissão negada. Habilite o microfone nas configurações.');
}

// Erro: Microfone não disponível
if (error.name === 'NotFoundError') {
  toast.error('Microfone não encontrado. Verifique seu dispositivo.');
}
```

#### Upload de Arquivos
```typescript
// Erro: Arquivo muito grande
if (audioBlob.size > MAX_FILE_SIZE) {
  toast.error('Arquivo de áudio muito grande. Máximo: 10MB');
  return;
}

// Erro: Falha no upload
if (uploadError) {
  toast.error('Erro ao enviar áudio. Tente novamente.');
  console.error('Upload error:', uploadError);
}
```

#### Reprodução de Áudio
```typescript
// Erro: Arquivo não encontrado
if (audio.error?.code === 4) {
  toast.error('Áudio não encontrado. Arquivo pode ter sido removido.');
}

// Erro: Formato não suportado
if (audio.error?.code === 3) {
  toast.error('Formato de áudio não suportado pelo navegador.');
}
```

---

## 🔮 Funcionalidades Futuras

### Melhorias Planejadas
- **Typing Indicators**: Indicador "digitando..."
- **Status de Presença**: Online/offline em tempo real
- **Busca em Mensagens**: Pesquisar no histórico
- **Anexos de Arquivo**: Envio de documentos/imagens
- **Emojis e Reações**: Reações rápidas às mensagens
- **Notificações Push**: Alertas no navegador
- **Chatbots**: Respostas automatizadas
- **Integração WhatsApp**: Sincronização com WhatsApp Business

### Otimizações Técnicas
- **Compressão de Áudio**: Reduzir tamanho dos arquivos
- **Lazy Loading**: Carregamento sob demanda de mensagens antigas
- **Cache Inteligente**: Otimização de performance
- **Offline Support**: Funcionalidade offline básica

---

## 🔗 Integrações

### Com Outros Módulos do Sistema
- **Status da Campanha**: Mensagens automáticas sobre mudanças de status
- **Briefing**: Notificações quando briefing é atualizado
- **Materiais**: Alertas sobre novos uploads
- **Problemas**: Comunicação direta sobre issues
- **Comissões**: Notificações sobre saques

### APIs Externas (Futuro)
- **WhatsApp Business API**: Sincronização de mensagens
- **Telegram Bot**: Notificações via Telegram
- **Email Integration**: Backup de conversas importantes
- **SMS Gateway**: Alertas via SMS para mensagens urgentes

---

[← Anterior: Fluxo de Trabalho](./05-fluxo-trabalho.md) | [Próximo: Sistema de Áudio →](./07-sistema-audio.md)
