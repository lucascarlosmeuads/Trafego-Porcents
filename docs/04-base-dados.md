
# 4. Base de Dados

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza **PostgreSQL** via **Supabase** com **Row Level Security (RLS)** para garantir isolamento de dados, incluindo **Storage** para arquivos e **Realtime** para comunicação instantânea.

---

## 📋 Tabelas Principais

### `todos_clientes` - Tabela Central
**Armazena todas as informações dos clientes e campanhas**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | bigint | Chave primária auto-incremento | ✅ |
| `nome_cliente` | text | Nome completo do cliente | ✅ |
| `email_cliente` | text | Email para login e contato | ✅ |
| `telefone` | text | Telefone com formatação | ✅ |
| `vendedor` | text | Nome do vendedor responsável | ✅ |
| `email_gestor` | text | Email do gestor responsável | ✅ |
| `status_campanha` | text | Estado atual da campanha | ✅ |
| `data_venda` | date | Data da venda inicial | ✅ |
| `data_limite` | text | Prazo calculado (15 dias) | Auto |
| `valor_comissao` | numeric | Valor da comissão (padrão R$ 60) | ✅ |
| `comissao` | text | Status: 'Pendente', 'Pago', 'Cancelado' | ✅ |
| `site_status` | text | Status de criação do site | ✅ |
| `site_pago` | boolean | Se o site foi pago | ✅ |
| `descricao_problema` | text | Descrição de problemas | ❌ |
| `link_briefing` | text | URL do briefing | ❌ |
| `link_criativo` | text | URL dos criativos | ❌ |
| `link_site` | text | URL do site finalizado | ❌ |
| `numero_bm` | text | Número do Business Manager | ❌ |
| `created_at` | timestamp | Data de criação (timezone BR) | Auto |

### `briefings_cliente` - Briefings Detalhados
**Informações específicas do briefing de cada cliente**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | Chave primária |
| `email_cliente` | text | Referência ao cliente |
| `nome_produto` | text | Nome do produto/serviço |
| `descricao_resumida` | text | Descrição do negócio |
| `publico_alvo` | text | Definição do público |
| `diferencial` | text | Diferenciais competitivos |
| `investimento_diario` | numeric | Valor de investimento diário |
| `comissao_aceita` | text | Aceite da comissão |
| `observacoes_finais` | text | Observações adicionais |
| `liberar_edicao` | boolean | Se permite edição |

### `chat_mensagens` - Sistema de Chat (NOVA)
**Mensagens do sistema de chat em tempo real**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | Chave primária |
| `email_gestor` | text | Email do gestor |
| `email_cliente` | text | Email do cliente |
| `cliente_id` | text | ID do cliente |
| `remetente` | text | Quem enviou (gestor/cliente) |
| `conteudo` | text | Conteúdo da mensagem |
| `tipo` | text | Tipo: 'texto' ou 'audio' |
| `status_campanha` | text | Status no momento da mensagem |
| `lida` | boolean | Se a mensagem foi lida |
| `created_at` | timestamp | Data/hora de criação |
| `updated_at` | timestamp | Última atualização |

### `vendas_cliente` - Registro de Vendas
**Vendas realizadas pelos clientes**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | Chave primária |
| `email_cliente` | text | Referência ao cliente |
| `data_venda` | date | Data da venda |
| `produto_vendido` | text | Produto/serviço vendido |
| `valor_venda` | numeric | Valor da venda |
| `observacoes` | text | Observações da venda |

### `arquivos_cliente` - Materiais Enviados
**Arquivos enviados pelos clientes**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | Chave primária |
| `email_cliente` | text | Referência ao cliente |
| `nome_arquivo` | text | Nome original do arquivo |
| `caminho_arquivo` | text | Caminho no storage |
| `tipo_arquivo` | text | Tipo MIME do arquivo |
| `tamanho_arquivo` | bigint | Tamanho em bytes |
| `author_type` | text | Quem fez upload (cliente/gestor) |

### `gestores` - Gestores do Sistema
**Cadastro e controle dos gestores**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | Chave primária |
| `nome` | text | Nome do gestor |
| `email` | text | Email único |
| `pode_adicionar_cliente` | boolean | Permissão de cadastro |
| `ativo` | boolean | Se está ativo |
| `user_id` | uuid | Referência ao auth.users |

### `comentarios_cliente` - Sistema de Comentários
**Comunicação interna sobre clientes**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | Chave primária |
| `cliente_id` | bigint | Referência ao cliente |
| `autor` | text | Quem escreveu |
| `comentario` | text | Conteúdo do comentário |
| `lido` | boolean | Se foi lido |

### `solicitacoes_saque` - Controle de Saques
**Solicitações de pagamento de comissões**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | Chave primária |
| `cliente_id` | bigint | Referência ao cliente |
| `email_gestor` | text | Gestor solicitante |
| `valor_comissao` | numeric | Valor solicitado |
| `status_saque` | text | Status da solicitação |
| `data_solicitacao` | timestamp | Data da solicitação |
| `processado_em` | timestamp | Data do processamento |

### `client_user_creation_log` - Log de Criação de Usuários
**Histórico de criação de usuários clientes**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | Chave primária |
| `email_cliente` | text | Email do cliente |
| `operation_type` | text | Tipo de operação |
| `result_message` | text | Resultado da operação |
| `created_at` | timestamp | Data da operação |

---

## 💾 Supabase Storage (NOVO)

### Buckets Configurados

#### `chat-audios`
**Armazenamento de mensagens de áudio**
- **Público**: Sim (para reprodução direta)
- **Organização**: `{user_id}/{timestamp}_audio.webm`
- **Tipos Aceitos**: audio/webm, audio/mp4, audio/wav
- **Tamanho Máximo**: 10MB por arquivo

#### `client-materials` (Planejado)
**Materiais enviados pelos clientes**
- **Público**: Não (acesso controlado)
- **Organização**: `{cliente_id}/{tipo}/{arquivo}`
- **Tipos Aceitos**: Imagens, vídeos, documentos
- **Tamanho Máximo**: 50MB por arquivo

### Políticas de Storage
```sql
-- Política para upload de áudios
CREATE POLICY "Allow authenticated users to upload audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-audios');

-- Política para leitura pública de áudios
CREATE POLICY "Allow public read access to audio files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-audios');

-- Política para listar próprios arquivos
CREATE POLICY "Allow users to list their own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-audios' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Política para deletar próprios arquivos
CREATE POLICY "Allow users to delete their own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-audios' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## 🔐 Segurança e RLS

### Row Level Security
**Todas as tabelas possuem RLS ativado com políticas específicas:**

- **Isolamento por Gestor**: Gestores só veem seus clientes
- **Isolamento por Cliente**: Clientes só veem seus próprios dados
- **Admin Full Access**: Admins têm acesso total
- **Auditoria Completa**: Logs de todas as operações
- **🆕 Chat Isolation**: Mensagens isoladas por relacionamento gestor-cliente

### Políticas Principais
```sql
-- Exemplo: Clientes só veem seus próprios dados
CREATE POLICY "cliente_acesso_proprio" ON todos_clientes
FOR ALL USING (email_cliente = auth.email());

-- Exemplo: Gestores veem apenas sua gestoria
CREATE POLICY "gestor_acesso_gestoria" ON todos_clientes
FOR ALL USING (email_gestor = auth.email());

-- Exemplo: Chat isolado por relacionamento
CREATE POLICY "chat_acesso_relacionamento" ON chat_mensagens
FOR ALL USING (
  email_gestor = auth.email() OR 
  email_cliente = auth.email()
);
```

---

## 🔗 Relacionamentos

### Relacionamentos Principais
```
gestores (1) ←→ (N) todos_clientes [email_gestor]
todos_clientes (1) ←→ (1) briefings_cliente [email_cliente]
todos_clientes (1) ←→ (N) vendas_cliente [email_cliente]
todos_clientes (1) ←→ (N) arquivos_cliente [email_cliente]
todos_clientes (1) ←→ (N) comentarios_cliente [cliente_id]
todos_clientes (1) ←→ (N) solicitacoes_saque [cliente_id]
todos_clientes (1) ←→ (N) chat_mensagens [email_cliente] (NOVO)
gestores (1) ←→ (N) chat_mensagens [email_gestor] (NOVO)
auth.users (1) ←→ (N) storage.objects [owner] (NOVO)
```

### Integridade Referencial
- **Foreign Keys**: Garantem consistência dos dados
- **Constraints**: Validações de negócio
- **Triggers**: Automatização de cálculos (data_limite, updated_at)

---

## 📊 Índices e Performance

### Índices Principais
```sql
-- Busca por email (muito comum)
CREATE INDEX idx_clientes_email ON todos_clientes(email_cliente);
CREATE INDEX idx_clientes_gestor ON todos_clientes(email_gestor);

-- Busca por status
CREATE INDEX idx_clientes_status ON todos_clientes(status_campanha);

-- Ordenação por data
CREATE INDEX idx_clientes_data ON todos_clientes(created_at);

-- NOVOS: Índices para chat
CREATE INDEX idx_chat_gestor ON chat_mensagens(email_gestor);
CREATE INDEX idx_chat_cliente ON chat_mensagens(email_cliente);
CREATE INDEX idx_chat_created ON chat_mensagens(created_at DESC);
CREATE INDEX idx_chat_lida ON chat_mensagens(lida) WHERE lida = false;
```

### Otimizações
- **Paginação**: Limit/Offset nas consultas
- **Filtros Eficientes**: Índices compostos
- **Cache**: Uso do TanStack Query
- **🆕 Realtime**: Subscriptions otimizadas para chat
- **🆕 Storage**: URLs públicas para performance

---

## 🔄 Triggers e Funções

### Triggers Existentes
```sql
-- Cálculo automático da data limite
CREATE TRIGGER calculate_data_limite_trigger
  BEFORE INSERT OR UPDATE ON todos_clientes
  FOR EACH ROW EXECUTE FUNCTION calculate_data_limite();

-- Atualização automática de updated_at
CREATE TRIGGER update_briefings_updated_at
  BEFORE UPDATE ON briefings_cliente
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- NOVO: Atualização de chat updated_at
CREATE TRIGGER update_chat_updated_at
  BEFORE UPDATE ON chat_mensagens
  FOR EACH ROW EXECUTE FUNCTION update_chat_mensagens_updated_at();
```

### Funções Personalizadas
```sql
-- Função para cálculo de data limite
CREATE OR REPLACE FUNCTION calculate_data_limite()
RETURNS trigger AS $$
BEGIN
  IF NEW.data_venda IS NOT NULL AND NEW.data_limite IS NULL THEN
    NEW.data_limite := NEW.data_venda + INTERVAL '15 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- NOVA: Função para updated_at do chat
CREATE OR REPLACE FUNCTION update_chat_mensagens_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔄 Migrações e Versionamento

### Controle de Versão
- **Supabase Migrations**: Versionamento automático
- **Rollback**: Possibilidade de reverter alterações
- **Backup**: Snapshots regulares
- **Ambiente de Teste**: Validação antes da produção

### Estratégia de Deploy
1. **Desenvolvimento**: Testes locais
2. **Staging**: Validação completa
3. **Produção**: Deploy controlado
4. **Monitoramento**: Verificação pós-deploy

### Atualizações Recentes
- **✅ Chat System**: Implementado sistema completo de chat
- **✅ Audio Messages**: Suporte a mensagens de áudio
- **✅ Storage Buckets**: Configuração para arquivos
- **✅ Realtime**: Mensagens em tempo real
- **✅ RLS Policies**: Segurança granular para chat

---

[← Anterior: Módulos do Sistema](./03-modulos-sistema.md) | [Próximo: Fluxo de Trabalho →](./05-fluxo-trabalho.md)
