
# 8. Troubleshooting

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
```

#### ❌ "Erro ao salvar/atualizar dados"
**Possíveis Causas:**
- Violação de constraints do banco
- RLS impedindo a operação
- Campos obrigatórios não preenchidos

**Soluções:**
1. **Verificar logs do Supabase**:
   - Acessar Dashboard > Logs > API
   - Procurar por erros relacionados ao timestamp da operação

2. **Validar dados antes de enviar**:
```typescript
// Exemplo de validação
const validateCliente = (cliente: any) => {
  if (!cliente.nome_cliente) throw new Error('Nome é obrigatório')
  if (!cliente.email_cliente) throw new Error('Email é obrigatório')
  if (!cliente.email_gestor) throw new Error('Gestor é obrigatório')
}
```

#### ❌ "Cliente aparece duplicado na lista"
**Possíveis Causas:**
- ID sendo tratado como string vs number
- Cache desatualizado
- Problema na query de atualização

**Soluções:**
```typescript
// Garantir conversão correta de tipos
const clienteId = Number(id) // Sempre converter para number
const { error } = await supabase
  .from('todos_clientes')
  .update(updates)
  .eq('id', clienteId) // Usar o número convertido
```

---

### **Problemas de Performance**

#### ❌ "Sistema muito lento"
**Possíveis Causas:**
- Muitas queries desnecessárias
- Falta de índices no banco
- Componentes renderizando excessivamente

**Soluções:**
1. **Otimizar queries**:
```typescript
// ❌ Ruim: buscar todos os campos
const { data } = await supabase.from('todos_clientes').select('*')

// ✅ Bom: buscar apenas campos necessários
const { data } = await supabase
  .from('todos_clientes')
  .select('id, nome_cliente, status_campanha, email_gestor')
  .limit(50)
```

2. **Implementar paginação**:
```typescript
const PAGE_SIZE = 50
const { data } = await supabase
  .from('todos_clientes')
  .select('*')
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
```

3. **Usar React.memo para componentes pesados**:
```typescript
export const ClienteRow = React.memo(({ cliente }: Props) => {
  // Componente só re-renderiza se props mudarem
})
```

#### ❌ "Upload de arquivos falha"
**Possíveis Causas:**
- Arquivo muito grande
- Tipo de arquivo não permitido
- Problema com Storage do Supabase

**Soluções:**
1. **Verificar tamanho e tipo**:
```typescript
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/', 'video/', 'application/pdf']

if (file.size > MAX_SIZE) {
  throw new Error('Arquivo muito grande')
}

if (!ALLOWED_TYPES.some(type => file.type.startsWith(type))) {
  throw new Error('Tipo de arquivo não permitido')
}
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
const isMobile = useIsMobile()

// Adaptar layout
<div className={`${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
  {/* Conteúdo adaptativo */}
</div>

// Classes responsivas do Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

#### ❌ "Botões não funcionam"
**Possíveis Causas:**
- JavaScript errors
- Event handlers não vinculados
- Loading state bloqueando ações

**Soluções:**
1. **Verificar console** (F12 > Console)
2. **Verificar estado de loading**:
```typescript
<Button 
  disabled={loading} 
  onClick={handleClick}
>
  {loading ? 'Salvando...' : 'Salvar'}
</Button>
```

---

### **Problemas Específicos por Módulo**

#### **Dashboard Admin**
❌ **Métricas não carregam**
```typescript
// Verificar se usuário é admin
const { isAdmin } = useAuth()
if (!isAdmin) {
  return <div>Acesso negado</div>
}

// Verificar queries
const { data, error, isLoading } = useQuery({
  queryKey: ['admin-metrics'],
  queryFn: fetchAdminMetrics,
  enabled: isAdmin // Só executa se for admin
})
```

#### **Gestão de Clientes**
❌ **Status não atualiza**
```typescript
// Verificar se mudança de status é permitida
const isValidTransition = (from: string, to: string) => {
  // Implementar regras de negócio
  if (from === 'Cliente Novo' && to === 'Reembolso') {
    return false // Não permitido
  }
  return true
}

// Usar otimistic updates
const { mutate } = useMutation({
  mutationFn: updateClienteStatus,
  onMutate: async (newStatus) => {
    // Atualizar UI imediatamente
    queryClient.setQueryData(['clientes'], (old: any) => 
      old.map((c: any) => 
        c.id === clienteId ? { ...c, status_campanha: newStatus } : c
      )
    )
  }
})
```

#### **Briefings**
❌ **Não consegue editar briefing**
```typescript
// Verificar se edição está liberada
const { data: briefing } = useQuery({
  queryKey: ['briefing', emailCliente],
  queryFn: () => fetchBriefing(emailCliente)
})

if (!briefing?.liberar_edicao) {
  return <div>Edição bloqueada pelo gestor</div>
}
```

---

### **Monitoramento e Logs**

#### **Como Ativar Logs Detalhados**
```typescript
// 1. Adicionar logs nos hooks
console.log('🔍 [useAuth] Verificando tipo de usuário:', email)
console.log('📊 [useClientes] Buscando clientes para gestor:', gestorEmail)
console.log('💾 [updateCliente] Atualizando cliente:', clienteId, updates)

// 2. Monitorar queries do Supabase
const supabase = createClient(url, key, {
  auth: {
    debug: process.env.NODE_ENV === 'development'
  }
})
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
```

---

### **Recuperação de Dados**

#### **Backup de Emergência**
```sql
-- Backup completo
pg_dump -h sua-url.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql

-- Backup apenas dados críticos
pg_dump -h sua-url.supabase.co -U postgres -d postgres \
  --table=todos_clientes \
  --table=briefings_cliente \
  --data-only > backup_dados.sql
```

#### **Restore Seletivo**
```sql
-- Restaurar apenas uma tabela
pg_restore -h sua-url.supabase.co -U postgres -d postgres \
  --table=todos_clientes backup.sql

-- Restaurar dados de um cliente específico
COPY todos_clientes FROM '/path/to/cliente_backup.csv' 
WITH (FORMAT csv, HEADER true);
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

---

### **Prevenção de Problemas**

#### **Checklist de Manutenção Semanal**
- [ ] Verificar logs de erro no Supabase
- [ ] Monitorar performance das queries principais
- [ ] Verificar backup automático
- [ ] Testar funcionalidades críticas
- [ ] Revisar métricas de uso

#### **Checklist de Deploy**
- [ ] Testar em ambiente de desenvolvimento
- [ ] Verificar migrações do banco
- [ ] Fazer backup antes do deploy
- [ ] Testar funcionalidades críticas pós-deploy
- [ ] Monitorar logs por 24h após deploy

---

[← Anterior: Guia Técnico](./07-guia-tecnico.md) | [Voltar ao Índice](./README.md)
