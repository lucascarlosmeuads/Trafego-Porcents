
# 7. Sistema de Áudio

## 🎵 Visão Geral

O Sistema de Áudio permite gravação, upload, armazenamento e reprodução de mensagens de áudio dentro do sistema de chat, proporcionando uma comunicação mais rica e eficiente entre gestores e clientes.

---

## 🎙️ Gravação de Áudio

### Tecnologia Utilizada
- **WebRTC**: API nativa do navegador para captura de áudio
- **MediaRecorder**: Interface para gravação de mídia
- **getUserMedia**: Acesso ao microfone do usuário

### Configurações de Gravação
```typescript
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
```

### Formatos Suportados
1. **Preferido**: `audio/webm;codecs=opus`
2. **Fallback**: `audio/webm`
3. **Alternativo**: `audio/mp4`
4. **Último recurso**: Formato padrão do navegador

### Processo de Gravação
```
1. Solicitar Permissão → 2. Configurar MediaRecorder → 3. Iniciar Gravação
         ↓                         ↓                         ↓
4. Capturar Chunks → 5. Parar Gravação → 6. Processar Blob → 7. Preview/Upload
```

---

## 🎛️ Interface de Gravação

### Estados da Interface
- **Idle**: Botão "Gravar" disponível
- **Recording**: Indicador visual + timer + botão "Parar"
- **Recorded**: Preview do áudio + opções (Play/Delete/Send)
- **Uploading**: Indicador de progresso
- **Error**: Mensagem de erro + opção de retry

### Componentes Visuais
```typescript
// Estado de gravação
<div className="flex items-center gap-2">
  <Button variant="destructive" onClick={stopRecording}>
    <Square className="h-4 w-4" />
    Parar
  </Button>
  <span className="text-red-500 font-mono flex items-center gap-1">
    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
    {formatDuration(duration)}
  </span>
</div>

// Estado de preview
<div className="flex items-center gap-2 w-full">
  <Button onClick={playAudio}>
    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
  </Button>
  <span className="flex-1">Áudio gravado ({formatDuration(duration)})</span>
  <Button variant="ghost" onClick={deleteAudio}>
    <Trash2 className="h-4 w-4" />
  </Button>
  <Button onClick={uploadAndSend} disabled={uploading}>
    {uploading ? 'Enviando...' : 'Enviar'}
  </Button>
</div>
```

---

## 💾 Armazenamento

### Supabase Storage
- **Bucket**: `chat-audios`
- **Público**: Sim (necessário para reprodução)
- **Organização**: `{user_id}/audio_{timestamp}.webm`
- **Tamanho Máximo**: 10MB por arquivo

### Estrutura de Pastas
```
chat-audios/
├── user_abc123/
│   ├── audio_1703123456789.webm
│   ├── audio_1703123567890.webm
│   └── audio_1703123678901.webm
├── user_def456/
│   ├── audio_1703124000000.webm
│   └── audio_1703124111111.webm
└── user_ghi789/
    └── audio_1703125000000.webm
```

### Processo de Upload
```typescript
const uploadAudio = async (audioBlob: Blob) => {
  // 1. Obter usuário autenticado
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Gerar nome único do arquivo
  const timestamp = Date.now();
  const fileName = `audio_${timestamp}.webm`;
  const filePath = `${user.id}/${fileName}`;
  
  // 3. Upload para o storage
  const { data, error } = await supabase.storage
    .from('chat-audios')
    .upload(filePath, audioBlob, {
      cacheControl: '3600',
      upsert: false,
      contentType: audioBlob.type
    });
  
  // 4. Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('chat-audios')
    .getPublicUrl(filePath);
    
  return `${publicUrl}?t=${timestamp}`;
};
```

---

## 🔊 Reprodução de Áudio

### Interface de Reprodução
```typescript
const AudioPlayer = ({ audioUrl, duration }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={hasError ? retryAudio : toggleAudio}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        ) : hasError ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      
      <div className="flex-1 min-w-0">
        <span className="text-sm">🎤 Mensagem de áudio</span>
        {duration && (
          <span className="text-xs opacity-75 ml-2">({duration})</span>
        )}
        {hasError && (
          <div className="text-xs text-red-500 mt-1">
            Erro ao carregar áudio. Toque para tentar novamente.
          </div>
        )}
      </div>
      
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        onLoadedMetadata={handleAudioLoadedMetadata}
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  );
};
```

### Tratamento de Erros na Reprodução
```typescript
const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
  const audio = e.currentTarget;
  const error = audio.error;
  
  console.error('Erro no áudio:', {
    error: error?.message,
    code: error?.code,
    src: audio.src,
    networkState: audio.networkState,
    readyState: audio.readyState
  });
  
  setHasError(true);
  setIsPlaying(false);
  
  // Códigos de erro específicos
  switch (error?.code) {
    case 1: // MEDIA_ERR_ABORTED
      toast.error('Reprodução interrompida pelo usuário');
      break;
    case 2: // MEDIA_ERR_NETWORK
      toast.error('Erro de rede ao carregar áudio');
      break;
    case 3: // MEDIA_ERR_DECODE
      toast.error('Erro ao decodificar áudio');
      break;
    case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
      toast.error('Formato de áudio não suportado');
      break;
    default:
      toast.error('Erro desconhecido ao reproduzir áudio');
  }
};
```

---

## 🔧 Otimizações e Performance

### Compressão de Áudio
```typescript
// Configuração otimizada para tamanho vs qualidade
const getOptimalSettings = (duration: number) => {
  if (duration < 30) {
    // Áudios curtos: priorizar qualidade
    return {
      audioBitsPerSecond: 128000,
      sampleRate: 44100
    };
  } else if (duration < 120) {
    // Áudios médios: equilibrar
    return {
      audioBitsPerSecond: 96000,
      sampleRate: 22050
    };
  } else {
    // Áudios longos: priorizar tamanho
    return {
      audioBitsPerSecond: 64000,
      sampleRate: 16000
    };
  }
};
```

### Cache e Preloading
```typescript
// Cache de URLs de áudio para evitar recarregamentos
const audioCache = new Map<string, string>();

const getCachedAudioUrl = (originalUrl: string) => {
  if (audioCache.has(originalUrl)) {
    return audioCache.get(originalUrl);
  }
  
  // Adicionar timestamp para cache busting quando necessário
  const cachedUrl = `${originalUrl}?cache=${Date.now()}`;
  audioCache.set(originalUrl, cachedUrl);
  
  return cachedUrl;
};

// Preload de áudios visíveis
const preloadAudios = (audioUrls: string[]) => {
  audioUrls.forEach(url => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = url;
  });
};
```

---

## 🛡️ Segurança

### Validação de Arquivos
```typescript
const validateAudioFile = (blob: Blob) => {
  // Verificar tamanho
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (blob.size > MAX_SIZE) {
    throw new Error('Arquivo muito grande. Máximo: 10MB');
  }
  
  // Verificar tipo MIME
  const allowedTypes = [
    'audio/webm',
    'audio/mp4',
    'audio/wav',
    'audio/ogg'
  ];
  
  if (!allowedTypes.some(type => blob.type.startsWith(type))) {
    throw new Error('Tipo de arquivo não permitido');
  }
  
  // Verificar duração (estimativa baseada no tamanho)
  const estimatedDuration = blob.size / 16000; // ~16KB/s para áudio comprimido
  const MAX_DURATION = 300; // 5 minutos
  
  if (estimatedDuration > MAX_DURATION) {
    throw new Error('Áudio muito longo. Máximo: 5 minutos');
  }
};
```

### Políticas de Storage
```sql
-- Permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-audios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir leitura pública para reprodução
CREATE POLICY "Public read access for audio playback"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-audios');

-- Permitir que usuários deletem apenas seus próprios arquivos
CREATE POLICY "Users can delete their own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-audios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 📊 Monitoramento e Métricas

### Métricas de Uso
```typescript
// Tracking de uso de áudio
const trackAudioUsage = {
  // Gravação
  recordingStarted: (duration: number) => {
    console.log(`🎙️ Gravação iniciada`);
  },
  
  recordingCompleted: (duration: number, fileSize: number) => {
    console.log(`✅ Gravação concluída: ${duration}s, ${fileSize} bytes`);
  },
  
  // Upload
  uploadStarted: (fileSize: number) => {
    console.log(`📤 Upload iniciado: ${fileSize} bytes`);
  },
  
  uploadCompleted: (fileSize: number, duration: number) => {
    console.log(`✅ Upload concluído em ${duration}ms`);
  },
  
  // Reprodução
  playbackStarted: (audioUrl: string) => {
    console.log(`▶️ Reprodução iniciada: ${audioUrl}`);
  },
  
  playbackError: (error: string, audioUrl: string) => {
    console.error(`❌ Erro na reprodução: ${error}`);
  }
};
```

### Estatísticas Disponíveis
- **Total de Áudios Gravados**: Por usuário e período
- **Duração Média**: Tempo médio dos áudios
- **Taxa de Sucesso**: Upload vs erros
- **Tamanho dos Arquivos**: Monitoramento de storage
- **Erros de Reprodução**: Problemas mais comuns

---

## 🔧 Troubleshooting

### Problemas Comuns

#### Permissão de Microfone Negada
```typescript
if (error.name === 'NotAllowedError') {
  // Orientar usuário sobre permissões
  toast.error(
    'Permissão de microfone negada. ' +
    'Clique no ícone de cadeado na barra de endereços e permita o acesso ao microfone.'
  );
}
```

#### Microfone Não Encontrado
```typescript
if (error.name === 'NotFoundError') {
  toast.error(
    'Microfone não encontrado. ' +
    'Verifique se há um microfone conectado ao seu dispositivo.'
  );
}
```

#### Erro de Upload
```typescript
const retryUpload = async (audioBlob: Blob, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const url = await uploadAudio(audioBlob);
      return url;
    } catch (error) {
      console.error(`Tentativa ${attempt} falhou:`, error);
      
      if (attempt === maxRetries) {
        throw new Error('Falha no upload após 3 tentativas. Tente novamente.');
      }
      
      // Aguardar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
};
```

#### Erro de Reprodução
```typescript
const retryAudio = () => {
  if (audioRef.current) {
    // Reset do elemento de áudio
    const currentSrc = audioRef.current.src;
    audioRef.current.src = '';
    audioRef.current.load();
    
    // Aguardar um pouco antes de recarregar
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = currentSrc;
        audioRef.current.load();
      }
    }, 100);
  }
};
```

---

## 🚀 Melhorias Futuras

### Funcionalidades Planejadas
- **Visualização de Forma de Onda**: Mostrar waveform durante reprodução
- **Controle de Velocidade**: Reprodução em 1.5x, 2x
- **Transcrição Automática**: Converter áudio em texto
- **Filtros de Áudio**: Redução de ruído, equalização
- **Compartilhamento**: Enviar áudios por link
- **Backup Local**: Salvar cópia local dos áudios

### Otimizações Técnicas
- **Streaming**: Reprodução durante o download
- **Compressão Adaptativa**: Ajustar qualidade baseado na conexão
- **Progressive Download**: Download em chunks
- **Background Processing**: Processamento em Web Workers

---

## 🔗 Integração com Outros Sistemas

### WhatsApp Business API (Futuro)
```typescript
// Sincronização de áudios com WhatsApp
const syncWithWhatsApp = async (audioUrl: string, clientPhone: string) => {
  // Integração com API do WhatsApp Business
  // para enviar o áudio também via WhatsApp
};
```

### Transcrição (Futuro)
```typescript
// Integração com serviços de speech-to-text
const transcribeAudio = async (audioUrl: string) => {
  // Usar OpenAI Whisper ou Google Speech-to-Text
  // para transcrever o áudio automaticamente
};
```

---

[← Anterior: Sistema de Chat](./06-sistema-chat.md) | [Próximo: Supabase Storage →](./08-supabase-storage.md)
