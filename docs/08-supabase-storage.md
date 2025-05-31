
# 8. Supabase Storage

## 📁 Visão Geral

O Supabase Storage é utilizado para armazenar e gerenciar todos os arquivos do sistema, incluindo mensagens de áudio, materiais de clientes, assets de campanhas e outros documentos importantes.

---

## 🗂️ Buckets Configurados

### `chat-audios` (Ativo)
**Armazenamento de mensagens de áudio do chat**

```sql
-- Configuração do bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-audios', 'chat-audios', true);
```

**Características:**
- **Público**: ✅ Sim (necessário para reprodução direta)
- **Tamanho Máximo**: 10MB por arquivo
- **Formatos Aceitos**: WebM, MP4, WAV, OGG
- **Organização**: `{user_id}/audio_{timestamp}.webm`
- **Retenção**: Indefinida (pode ser configurada limpeza automática)

**Estrutura de Pastas:**
```
chat-audios/
├── 550e8400-e29b-41d4-a716-446655440000/
│   ├── audio_1703123456789.webm
│   ├── audio_1703123567890.webm
│   └── audio_1703123678901.webm
├── 6ba7b810-9dad-11d1-80b4-00c04fd430c8/
│   ├── audio_1703124000000.webm
│   └── audio_1703124111111.webm
└── ...
```

### `client-materials` (Planejado)
**Materiais enviados pelos clientes**

**Características:**
- **Público**: ❌ Não (acesso controlado)
- **Tamanho Máximo**: 50MB por arquivo
- **Formatos Aceitos**: PNG, JPG, PDF, MP4, ZIP, etc.
- **Organização**: `{cliente_id}/{categoria}/{arquivo}`
- **Retenção**: Permanente

**Estrutura Planejada:**
```
client-materials/
├── cliente_123/
│   ├── logos/
│   │   ├── logo_principal.png
│   │   └── logo_alternativo.svg
│   ├── fotos/
│   │   ├── produto_01.jpg
│   │   └── equipe_foto.jpg
│   ├── documentos/
│   │   ├── contrato.pdf
│   │   └── catalogo.pdf
│   └── videos/
│       └── apresentacao.mp4
```

### `campaign-assets` (Planejado)
**Assets das campanhas criados internamente**

**Características:**
- **Público**: ❌ Não (acesso interno)
- **Organização**: `{campanha_id}/{tipo}/{arquivo}`
- **Versionamento**: Múltiplas versões dos arquivos

---

## 🔐 Políticas de Segurança (RLS)

### Políticas para `chat-audios`

#### Upload de Áudios
```sql
CREATE POLICY "Allow authenticated users to upload audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-audios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Leitura Pública
```sql
CREATE POLICY "Allow public read access to audio files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-audios');
```

#### Listagem de Próprios Arquivos
```sql
CREATE POLICY "Allow users to list their own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-audios' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Deletar Próprios Arquivos
```sql
CREATE POLICY "Allow users to delete their own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-audios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Políticas para `client-materials` (Futuro)

#### Upload Controlado
```sql
CREATE POLICY "Allow clients and managers to upload materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-materials' AND
  (
    -- Cliente pode fazer upload em sua própria pasta
    EXISTS (
      SELECT 1 FROM todos_clientes 
      WHERE email_cliente = auth.email() 
      AND id::text = (storage.foldername(name))[1]
    )
    OR
    -- Gestor pode fazer upload para clientes da sua gestoria
    EXISTS (
      SELECT 1 FROM todos_clientes 
      WHERE email_gestor = auth.email()
      AND id::text = (storage.foldername(name))[1]
    )
  )
);
```

---

## 📤 Upload de Arquivos

### Implementação Básica
```typescript
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
    throw new Error(`Erro no upload: ${error.message}`);
  }
  
  // Retornar URL pública (se bucket for público)
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return publicUrl;
};
```

### Upload com Progress
```typescript
const uploadWithProgress = async (
  file: File,
  bucket: string,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Monitorar progresso
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    };
    
    // Preparar form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Configurar request
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/${bucket}/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`);
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);
        resolve(publicUrl);
      } else {
        reject(new Error(`Upload falhou: ${xhr.statusText}`));
      }
    };
    
    xhr.onerror = () => reject(new Error('Erro de rede durante upload'));
    xhr.send(formData);
  });
};
```

---

## 📥 Download e Acesso

### URLs Públicas vs Privadas

#### Bucket Público (`chat-audios`)
```typescript
// Para buckets públicos, URL é gerada diretamente
const { data: { publicUrl } } = supabase.storage
  .from('chat-audios')
  .getPublicUrl(filePath);

// URL resultante:
// https://projeto.supabase.co/storage/v1/object/public/chat-audios/user_id/audio.webm
```

#### Bucket Privado (`client-materials`)
```typescript
// Para buckets privados, usar signed URLs
const { data, error } = await supabase.storage
  .from('client-materials')
  .createSignedUrl(filePath, 3600); // Válida por 1 hora

if (data) {
  const signedUrl = data.signedUrl;
  // URL com token temporário de acesso
}
```

### Download Programático
```typescript
const downloadFile = async (bucket: string, path: string): Promise<Blob> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);
    
  if (error) {
    throw new Error(`Erro no download: ${error.message}`);
  }
  
  return data;
};

// Uso
const audioBlob = await downloadFile('chat-audios', 'user/audio.webm');
const audioUrl = URL.createObjectURL(audioBlob);
```

---

## 🧹 Gestão de Arquivos

### Listagem de Arquivos
```typescript
const listFiles = async (
  bucket: string, 
  folder?: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: 'asc' | 'desc' };
  }
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      sortBy: options?.sortBy || { column: 'created_at', order: 'desc' }
    });
    
  return data;
};

// Exemplo: Listar áudios de um usuário
const userAudios = await listFiles('chat-audios', 'user_abc123');
```

### Deletar Arquivos
```typescript
const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
    
  if (error) {
    throw new Error(`Erro ao deletar: ${error.message}`);
  }
};

// Deletar múltiplos arquivos
const deleteFiles = async (bucket: string, paths: string[]): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);
    
  if (error) {
    throw new Error(`Erro ao deletar arquivos: ${error.message}`);
  }
};
```

### Mover/Renomear Arquivos
```typescript
const moveFile = async (
  bucket: string, 
  fromPath: string, 
  toPath: string
): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .move(fromPath, toPath);
    
  if (error) {
    throw new Error(`Erro ao mover arquivo: ${error.message}`);
  }
};
```

---

## 📊 Monitoramento e Métricas

### Estatísticas de Storage
```typescript
const getStorageStats = async () => {
  // Estatísticas por bucket
  const stats = await Promise.all([
    getBucketStats('chat-audios'),
    getBucketStats('client-materials'),
    getBucketStats('campaign-assets')
  ]);
  
  return {
    totalSize: stats.reduce((acc, stat) => acc + stat.size, 0),
    totalFiles: stats.reduce((acc, stat) => acc + stat.count, 0),
    buckets: stats
  };
};

const getBucketStats = async (bucketName: string) => {
  const files = await listAllFiles(bucketName);
  
  return {
    bucket: bucketName,
    count: files.length,
    size: files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0),
    lastModified: Math.max(...files.map(f => new Date(f.updated_at).getTime()))
  };
};
```

### Limpeza Automática
```typescript
// Edge Function para limpeza automática de arquivos antigos
const cleanupOldFiles = async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 dias atrás
  
  // Listar arquivos antigos de chat-audios
  const oldAudios = await supabase.storage
    .from('chat-audios')
    .list('', {
      sortBy: { column: 'created_at', order: 'asc' }
    });
    
  const filesToDelete = oldAudios?.data?.filter(file => 
    new Date(file.created_at) < cutoffDate
  ).map(file => file.name) || [];
  
  if (filesToDelete.length > 0) {
    await supabase.storage
      .from('chat-audios')
      .remove(filesToDelete);
      
    console.log(`Removidos ${filesToDelete.length} arquivos antigos`);
  }
};
```

---

## 🔧 Validação e Segurança

### Validação de Arquivos
```typescript
const validateFile = (file: File, constraints: {
  maxSize?: number;
  allowedTypes?: string[];
  maxDimensions?: { width: number; height: number };
}) => {
  // Verificar tamanho
  if (constraints.maxSize && file.size > constraints.maxSize) {
    throw new Error(`Arquivo muito grande. Máximo: ${formatBytes(constraints.maxSize)}`);
  }
  
  // Verificar tipo
  if (constraints.allowedTypes && !constraints.allowedTypes.includes(file.type)) {
    throw new Error(`Tipo não permitido. Aceitos: ${constraints.allowedTypes.join(', ')}`);
  }
  
  // Para imagens, verificar dimensões
  if (file.type.startsWith('image/') && constraints.maxDimensions) {
    return validateImageDimensions(file, constraints.maxDimensions);
  }
  
  return true;
};

const validateImageDimensions = (file: File, maxDimensions: { width: number; height: number }): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.width > maxDimensions.width || img.height > maxDimensions.height) {
        reject(new Error(`Imagem muito grande. Máximo: ${maxDimensions.width}x${maxDimensions.height}`));
      } else {
        resolve(true);
      }
    };
    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};
```

### Sanitização de Nomes
```typescript
const sanitizeFileName = (fileName: string): string => {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_') // Substituir caracteres especiais
    .replace(/_+/g, '_')          // Múltiplos underscores em um
    .replace(/^_|_$/g, '');       // Remover underscores das pontas
};

const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const sanitized = sanitizeFileName(originalName);
  const extension = sanitized.split('.').pop();
  const nameWithoutExt = sanitized.replace(`.${extension}`, '');
  
  return `${nameWithoutExt}_${timestamp}.${extension}`;
};
```

---

## 🚀 Otimizações

### Resize de Imagens
```typescript
const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calcular dimensões mantendo aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Converter para blob
      canvas.toBlob(resolve!, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

### Compressão de Áudio
```typescript
const compressAudio = async (audioBlob: Blob): Promise<Blob> => {
  // Para implementação futura com Web Audio API
  // Reduzir bitrate, sample rate, etc.
  return audioBlob; // Por enquanto, retorna sem modificação
};
```

---

## 🔄 Backup e Recuperação

### Backup de Buckets
```typescript
const backupBucket = async (bucketName: string) => {
  // Listar todos os arquivos
  const files = await listAllFiles(bucketName);
  
  // Fazer download de cada arquivo
  const backupData = await Promise.all(
    files.map(async (file) => {
      const blob = await downloadFile(bucketName, file.name);
      return {
        path: file.name,
        data: blob,
        metadata: file.metadata
      };
    })
  );
  
  return backupData;
};
```

### Restore de Backup
```typescript
const restoreBucket = async (bucketName: string, backupData: any[]) => {
  for (const item of backupData) {
    await supabase.storage
      .from(bucketName)
      .upload(item.path, item.data, {
        upsert: true,
        contentType: item.metadata?.mimetype
      });
  }
};
```

---

## 🔗 Integração com Outros Módulos

### Chat Integration
```typescript
// Quando mensagem de áudio é enviada
const handleAudioMessage = async (audioBlob: Blob, clienteId: string) => {
  // Upload para storage
  const audioUrl = await uploadAudio(audioBlob);
  
  // Salvar mensagem no banco
  await saveChatMessage({
    cliente_id: clienteId,
    tipo: 'audio',
    conteudo: audioUrl,
    remetente: 'gestor'
  });
};
```

### Materials Upload
```typescript
// Upload de materiais do cliente
const uploadClientMaterial = async (file: File, clienteId: string, category: string) => {
  const path = `${clienteId}/${category}/${generateUniqueFileName(file.name)}`;
  const url = await uploadFile(file, 'client-materials', path);
  
  // Registrar no banco
  await supabase.from('arquivos_cliente').insert({
    email_cliente: getClientEmail(clienteId),
    nome_arquivo: file.name,
    caminho_arquivo: path,
    tipo_arquivo: file.type,
    tamanho_arquivo: file.size,
    author_type: 'cliente'
  });
  
  return url;
};
```

---

[← Anterior: Sistema de Áudio](./07-sistema-audio.md) | [Próximo: Troubleshooting →](./09-troubleshooting.md)
