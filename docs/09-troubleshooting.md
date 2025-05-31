
# 9. Troubleshooting

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
4. Para admins: verificar na tabela `auth.users` do Supabase

#### ❌ "Usuário não autorizado"
**Possíveis Causas:**
- Email não está cadastrado em nenhuma tabela
- Domínio do email não é reconhecido pelo sistema
- Usuário foi desativado

**Soluções:**
1. **Para Gestores**: Verificar se está cadastrado na tabela `gestores` com `ativo = true`
2. **Para Clientes**: Verificar se está na tabela `todos_clientes`
3. **Para Vendedores**: Email deve seguir padrão `vendedor*@trafegoporcents.com`
4. **Para Sites**: Email deve conter palavras-chave como 'criador', 'site', 'design'

#### ❌ "Infinite loading" na tela de login
**Possíveis Causas:**
- Problema de conectividade com Supabase
- RLS (Row Level Security) bloqueando acesso
- JavaScript error na console

**Soluções:**
1. Verificar console do navegador (F12)
2. Testar conectividade: `ping supabase.co`
3. Verificar se Supabase está online: status.supabase.com
4. Limpar cache do navegador

---

### **Problemas com Chat e Mensagens**

#### ❌ "Mensagens não aparecem em tempo real"
**Possíveis Causas:**
- Problemas com Supabase Realtime
- Subscription não configurada corretamente
- RLS bloqueando acesso às mensagens

**Soluções:**
```typescript
// 1. Verificar se realtime está habilitado
const subscription = supabase
  .channel('chat-mensagens')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_mensagens',
    filter: `email_gestor=eq.${email}`
  }, (payload) => {
    console.log('📥 Nova mensagem recebida:', payload);
  })
  .subscribe((status) => {
    console.log('🔗 Status da subscription:', status);
  });

// 2. Verificar se a subscription está ativa
if (subscription.state !== 'subscribed') {
  console.error('❌ Subscription não ativa');
}
```

#### ❌ "Erro ao enviar mensagem"
**Possíveis Causas:**
- RLS impedindo inserção
- Campos obrigatórios não preenchidos
- Problema de conectividade

**Soluções:**
```sql
-- Verificar RLS policies para chat_mensagens
SELECT * FROM pg_policies WHERE tablename = 'chat_mensagens';

-- Testar inserção manual
INSERT INTO chat_mensagens (
  email_gestor, email_cliente, cliente_id, 
  remetente, conteudo, tipo
) VALUES (
  'gestor@trafegoporcents.com', 
  'cliente@email.com', 
  '123',
  'gestor', 
  'Teste', 
  'texto'
);
```

#### ❌ "Chat não carrega conversas anteriores"
**Possíveis Causas:**
- Filtros incorretos na query
- RLS bloqueando acesso
- Problema de performance

**Soluções:**
```typescript
// Query otimizada para carregar mensagens
const { data, error } = await supabase
  .from('chat_mensagens')
  .select('*')
  .eq('cliente_id', clienteId)
  .order('created_at', { ascending: true })
  .limit(50); // Paginação

if (error) {
  console.error('❌ Erro ao carregar mensagens:', error);
}
```

---

### **Problemas com Áudio**

#### ❌ "Não consegue gravar áudio"
**Possíveis Causas:**
- Permissão de microfone negada
- Microfone não encontrado
- Navegador não suporta WebRTC

**Soluções:**
```typescript
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
        console.error('❌ Permissão negada para microfone');
        alert('Permita o acesso ao microfone nas configurações do navegador');
        break;
      case 'NotFoundError':
        console.error('❌ Microfone não encontrado');
        alert('Nenhum microfone foi encontrado no dispositivo');
        break;
      case 'NotSupportedError':
        console.error('❌ Navegador não suporta getUserMedia');
        alert('Navegador não suporta gravação de áudio');
        break;
      default:
        console.error('❌ Erro desconhecido:', error);
    }
  }
};
```

#### ❌ "Áudio não reproduz"
**Possíveis Causas:**
- URL do áudio inválida
- Arquivo corrompido
- Problemas de CORS
- Bucket não público

**Soluções:**
```typescript
const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
  const audio = e.currentTarget;
  const error = audio.error;
  
  switch (error?.code) {
    case 1: // MEDIA_ERR_ABORTED
      console.error('❌ Reprodução abortada');
      break;
    case 2: // MEDIA_ERR_NETWORK
      console.error('❌ Erro de rede');
      // Tentar novamente após delay
      setTimeout(() => {
        audio.load();
        audio.play();
      }, 2000);
      break;
    case 3: // MEDIA_ERR_DECODE
      console.error('❌ Erro de decodificação');
      break;
    case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
      console.error('❌ Formato não suportado');
      break;
  }
};

// Verificar se bucket está público
const checkBucketStatus = async () => {
  const { data, error } = await supabase
    .from('storage.buckets')
    .select('public')
    .eq('id', 'chat-audios')
    .single();
    
  if (!data?.public) {
    console.error('❌ Bucket não está público');
  }
};
```

#### ❌ "Upload de áudio falha"
**Possíveis Causas:**
- Arquivo muito grande
- RLS impedindo upload
- Problema de conectividade
- Bucket não configurado

**Soluções:**
```typescript
const uploadAudio = async (audioBlob: Blob) => {
  // Verificar tamanho
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (audioBlob.size > MAX_SIZE) {
    throw new Error('Arquivo muito grande. Máximo: 10MB');
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    const fileName = `audio_${Date.now()}.webm`;
    const filePath = `${user.id}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('chat-audios')
      .upload(filePath, audioBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: audioBlob.type
      });
      
    if (error) {
      console.error('❌ Erro no upload:', error);
      throw error;
    }
    
    console.log('✅ Upload concluído:', data);
    
  } catch (error) {
    console.error('💥 Erro no upload de áudio:', error);
    throw error;
  }
};
```

---

### **Problemas com Storage**

#### ❌ "Bucket não encontrado"
**Possíveis Causas:**
- Bucket não foi criado
- Nome do bucket incorreto

**Soluções:**
```sql
-- Verificar buckets existentes
SELECT * FROM storage.buckets;

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-audios', 'chat-audios', true);
```

#### ❌ "Políticas RLS bloqueando acesso"
**Possíveis Causas:**
- Políticas muito restritivas
- Políticas não configuradas

**Soluções:**
```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Recriar políticas básicas
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

CREATE POLICY "Allow authenticated upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat-audios');

CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'chat-audios');
```

---

### **Problemas de Performance**

#### ❌ "Sistema muito lento"
**Possíveis Causas:**
- Muitas queries desnecessárias
- Falta de índices no banco
- Componentes renderizando excessivamente
- Subscription ativa demais

**Soluções:**
```typescript
// 1. Otimizar queries
const { data } = await supabase
  .from('todos_clientes')
  .select('id, nome_cliente, status_campanha, email_gestor') // Apenas campos necessários
  .limit(50)
  .order('created_at', { ascending: false });

// 2. Usar React.memo para componentes pesados
export const ClienteRow = React.memo(({ cliente }: Props) => {
  // Componente só re-renderiza se props mudarem
});

// 3. Debounce em buscas
const debouncedSearch = useMemo(
  () => debounce((searchTerm: string) => {
    fetchClientes(searchTerm);
  }, 300),
  []
);

// 4. Cleanup de subscriptions
useEffect(() => {
  return () => {
    subscription?.unsubscribe();
  };
}, []);
```

#### ❌ "Mensagens de chat lentas"
**Possíveis Causas:**
- Subscription ineficiente
- Muitas mensagens carregadas
- Falta de índices

**Soluções:**
```sql
-- Criar índices para chat
CREATE INDEX IF NOT EXISTS idx_chat_cliente_created 
ON chat_mensagens(cliente_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_gestor_created 
ON chat_mensagens(email_gestor, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_unread 
ON chat_mensagens(lida) WHERE lida = false;
```

```typescript
// Paginação de mensagens
const loadMessages = async (page = 0, limit = 20) => {
  const { data } = await supabase
    .from('chat_mensagens')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);
    
  return data;
};
```

---

### **Problemas com Dados e Tabelas**

#### ❌ "Dados não carregam" ou "Lista vazia"
**Possíveis Causas:**
- RLS bloqueando acesso aos dados
- Filtros muito restritivos
- Problemas de conectividade

**Soluções:**
```sql
-- 1. Verificar RLS policies
SELECT * FROM pg_policies WHERE tablename = 'todos_clientes';

-- 2. Testar query diretamente
SELECT count(*) FROM todos_clientes;

-- 3. Verificar dados do usuário atual
SELECT auth.email(), auth.uid();

-- 4. Desabilitar RLS temporariamente para teste (apenas dev)
ALTER TABLE todos_clientes DISABLE ROW LEVEL SECURITY;
-- Lembrar de reabilitar depois!
```

#### ❌ "Erro ao salvar/atualizar dados"
**Possíveis Causas:**
- Violação de constraints do banco
- RLS impedindo a operação
- Campos obrigatórios não preenchidos

**Soluções:**
```typescript
// 1. Validar dados antes de enviar
const validateCliente = (cliente: any) => {
  if (!cliente.nome_cliente) throw new Error('Nome é obrigatório');
  if (!cliente.email_cliente) throw new Error('Email é obrigatório');
  if (!cliente.email_gestor) throw new Error('Gestor é obrigatório');
};

// 2. Tratar erros específicos
const saveCliente = async (cliente: any) => {
  try {
    validateCliente(cliente);
    
    const { data, error } = await supabase
      .from('todos_clientes')
      .insert(cliente);
      
    if (error) {
      if (error.code === '23505') {
        throw new Error('Cliente já existe com este email');
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao salvar cliente:', error);
    throw error;
  }
};
```

---

### **Problemas de Interface**

#### ❌ "Layout quebrado no mobile"
**Possíveis Causas:**
- Classes Tailwind incorretas
- Componentes não responsivos
- Sidebar não se adaptando

**Soluções:**
```typescript
// Usar hook para detectar mobile
const isMobile = useIsMobile();

// Adaptar layout
<div className={`${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
  {/* Conteúdo adaptativo */}
</div>

// Classes responsivas do Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Grid responsivo */}
</div>

// Chat responsivo
<div className={`
  ${isMobile ? 'fixed inset-0 z-50' : 'relative'}
  ${isMobile ? 'bg-background' : ''}
`}>
  {/* Chat adaptável */}
</div>
```

#### ❌ "Botões não funcionam"
**Possíveis Causas:**
- JavaScript errors
- Event handlers não vinculados
- Loading state bloqueando ações

**Soluções:**
```typescript
// 1. Verificar console (F12 > Console)
// 2. Verificar estado de loading
<Button 
  disabled={loading} 
  onClick={handleClick}
>
  {loading ? 'Salvando...' : 'Salvar'}
</Button>

// 3. Adicionar logs para debug
const handleClick = () => {
  console.log('🔘 Botão clicado');
  try {
    // Ação do botão
  } catch (error) {
    console.error('❌ Erro no botão:', error);
  }
};
```

---

### **Monitoramento e Logs**

#### **Como Ativar Logs Detalhados**
```typescript
// 1. Adicionar logs nos hooks
console.log('🔍 [useAuth] Verificando tipo de usuário:', email);
console.log('📊 [useClientes] Buscando clientes para gestor:', gestorEmail);
console.log('💾 [updateCliente] Atualizando cliente:', clienteId, updates);
console.log('💬 [useChatMessages] Nova mensagem:', mensagem);
console.log('🎵 [AudioRecorder] Upload de áudio:', audioUrl);

// 2. Monitorar queries do Supabase
const supabase = createClient(url, key, {
  auth: {
    debug: process.env.NODE_ENV === 'development'
  }
});
```

#### **Verificar Logs do Supabase**
1. Acessar Dashboard do Supabase
2. Ir em **Logs** > **API**
3. Filtrar por timestamp do problema
4. Procurar por status 400, 401, 403, 500

#### **Logs Importantes para Acompanhar**
```sql
-- RLS violations
SELECT * FROM auth.audit_log_entries 
WHERE error_code = 'insufficient_privilege'
ORDER BY created_at DESC;

-- Failed authentications
SELECT * FROM auth.audit_log_entries 
WHERE event_type = 'login'
AND error_code IS NOT NULL
ORDER BY created_at DESC;

-- Storage operations
SELECT * FROM auth.audit_log_entries 
WHERE event_type LIKE '%storage%'
ORDER BY created_at DESC;
```

---

### **Contatos para Suporte**

#### **Suporte Técnico**
- **Email**: suporte.tecnico@empresa.com
- **WhatsApp**: (11) 99999-9999
- **Horário**: Segunda a Sexta, 8h às 18h
- **Urgências**: 24/7 para problemas críticos

#### **Escalação de Problemas**
1. **Nível 1**: Suporte básico e orientações
2. **Nível 2**: Problemas técnicos complexos
3. **Nível 3**: Desenvolvedor principal
4. **Crítico**: CTO/Diretor técnico

#### **Informações para Reportar Problemas**
Sempre incluir:
- **URL da página** onde ocorreu o problema
- **Email do usuário** afetado
- **Horário exato** do problema
- **Steps para reproduzir** o erro
- **Screenshots** da tela e console (F12)
- **Mensagem de erro** completa
- **Tipo de dispositivo** (desktop/mobile)
- **Navegador** e versão

---

### **Prevenção de Problemas**

#### **Checklist de Manutenção Semanal**
- [ ] Verificar logs de erro no Supabase
- [ ] Monitorar performance das queries principais
- [ ] Verificar backup automático
- [ ] Testar funcionalidades críticas (login, chat, áudio)
- [ ] Revisar métricas de uso
- [ ] Limpar arquivos antigos do storage
- [ ] Verificar subscriptions ativas

#### **Checklist de Deploy**
- [ ] Testar em ambiente de desenvolvimento
- [ ] Verificar migrações do banco
- [ ] Fazer backup antes do deploy
- [ ] Testar funcionalidades críticas pós-deploy
- [ ] Monitorar logs por 24h após deploy
- [ ] Verificar realtime subscriptions
- [ ] Testar upload/reprodução de áudio

---

[← Anterior: Supabase Storage](./08-supabase-storage.md) | [Voltar ao Índice](./README.md)
