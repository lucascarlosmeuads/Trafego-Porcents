
# 7. Guia Técnico

## 🔧 Configuração do Ambiente

### **Pré-requisitos**
- **Node.js**: v18+ (recomendado v20)
- **npm**: v9+ ou **yarn** v1.22+
- **Git**: Para controle de versão
- **VS Code**: Editor recomendado

### **Configuração Inicial**
```bash
# 1. Clonar o repositório
git clone <repository-url>
cd sistema-gestao-clientes

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

### **Variáveis de Ambiente**
```env
VITE_SUPABASE_URL=https://rxpgqunqsegypssoqpyf.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

---

## 🏗️ Estrutura do Projeto

### **Arquitetura Geral**
```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── AdminDashboard/ # Componentes específicos do admin
│   ├── ClienteDashboard/ # Componentes do cliente
│   └── ...
├── hooks/              # Hooks customizados
├── lib/                # Configurações e utilitários
├── pages/              # Páginas da aplicação
├── types/              # Definições de tipos TypeScript
├── utils/              # Funções utilitárias
└── integrations/       # Integrações externas (Supabase)
```

### **Componentes Principais**

#### **Dashboard Components**
```typescript
// AdminDashboard.tsx - Dashboard administrativo
export function AdminDashboard({ selectedManager, activeTab }: Props)

// GestorDashboard.tsx - Dashboard dos gestores
export function GestorDashboard()

// ClienteDashboard.tsx - Dashboard dos clientes
export function ClienteDashboard()

// VendedorDashboard.tsx - Dashboard dos vendedores
export function VendedorDashboard()
```

#### **Table Components**
```typescript
// ClientesTable.tsx - Tabela principal de clientes
export function ClientesTable({ 
  selectedManager, 
  filterType 
}: ClientesTableProps)

// AdminTable.tsx - Tabela administrativa
export function AdminTable()
```

### **Hooks Customizados**

#### **Autenticação**
```typescript
// useAuth.tsx - Hook principal de autenticação
export function useAuth(): AuthContextType {
  return {
    user,
    loading,
    signIn,
    signOut,
    isAdmin,
    isGestor,
    isCliente,
    isVendedor,
    isSites,
    currentManagerName
  }
}
```

#### **Gestão de Dados**
```typescript
// useClienteOperations.ts - Operações com clientes
export function useClienteOperations(
  userEmail: string,
  isAdmin: boolean,
  refetchData: () => void
)

// useManagerData.tsx - Dados dos gestores
export function useManagerData()

// useSolicitacoesPagas.ts - Controle de comissões
export function useSolicitacoesPagas()
```

---

## 🗄️ Integração com Supabase

### **Configuração do Cliente**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://rxpgqunqsegypssoqpyf.supabase.co"
const supabaseAnonKey = "sua_chave_aqui"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### **Tipos do Banco de Dados**
```typescript
// integrations/supabase/types.ts
export type Cliente = {
  id: number
  nome_cliente: string
  email_cliente: string
  status_campanha: string
  // ... outros campos
}

export type Gestor = {
  id: string
  nome: string
  email: string
  ativo: boolean
  // ... outros campos
}
```

### **Operações CRUD**
```typescript
// Exemplo: Buscar clientes
const { data, error } = await supabase
  .from('todos_clientes')
  .select('*')
  .eq('email_gestor', gestorEmail)
  .order('created_at', { ascending: false })

// Exemplo: Atualizar cliente
const { error } = await supabase
  .from('todos_clientes')
  .update({ status_campanha: novoStatus })
  .eq('id', clienteId)

// Exemplo: Inserir novo cliente
const { data, error } = await supabase
  .from('todos_clientes')
  .insert([{
    nome_cliente: nome,
    email_cliente: email,
    // ... outros campos
  }])
```

---

## 🔐 Sistema de Autenticação

### **Fluxo de Autenticação**
```typescript
// 1. Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
})

// 2. Verificação de tipo de usuário
const userType = await checkUserType(user.email)

// 3. Redirecionamento baseado no tipo
switch (userType) {
  case 'admin': return <AdminDashboard />
  case 'gestor': return <GestorDashboard />
  case 'cliente': return <ClienteDashboard />
  case 'vendedor': return <VendedorDashboard />
  case 'sites': return <SitesDashboard />
}
```

### **Proteção de Rotas**
```typescript
// AuthGuard component
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />
  
  return <>{children}</>
}
```

### **Row Level Security (RLS)**
```sql
-- Exemplo: Política para gestores
CREATE POLICY "gestores_acesso_proprio" ON todos_clientes
FOR ALL USING (
  email_gestor = auth.email() OR 
  auth.email() LIKE '%@admin%'
);

-- Exemplo: Política para clientes
CREATE POLICY "clientes_acesso_proprio" ON briefings_cliente
FOR ALL USING (email_cliente = auth.email());
```

---

## 🎨 Sistema de Estilos

### **Tailwind CSS**
```typescript
// Configuração principal no tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        // ... cores customizadas
      }
    }
  }
}
```

### **Componentes shadcn/ui**
```typescript
// Exemplo de uso dos componentes
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

// Uso no JSX
<Card>
  <CardHeader>
    <h2>Título</h2>
  </CardHeader>
  <CardContent>
    <Button variant="default">Ação</Button>
  </CardContent>
</Card>
```

### **Temas e Dark Mode**
```typescript
// ThemeProvider.tsx
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

---

## 📱 Responsividade

### **Breakpoints Tailwind**
```css
/* Mobile First */
sm: '640px'   /* Tablet */
md: '768px'   /* Desktop pequeno */
lg: '1024px'  /* Desktop médio */
xl: '1280px'  /* Desktop grande */
2xl: '1536px' /* Desktop muito grande */
```

### **Exemplo de Implementação**
```typescript
// Hook para detectar mobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])
  
  return isMobile
}

// Uso no componente
const isMobile = useIsMobile()

return (
  <div className={`${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
    {/* Conteúdo adaptativo */}
  </div>
)
```

---

## 🚀 Deploy e Produção

### **Build de Produção**
```bash
# 1. Build da aplicação
npm run build

# 2. Preview local
npm run preview

# 3. Deploy (exemplo com Vercel)
npm install -g vercel
vercel --prod
```

### **Configurações de Produção**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
})
```

### **Variáveis de Ambiente em Produção**
```env
# .env.production
VITE_SUPABASE_URL=https://sua-url-producao.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_producao
```

---

## 🧪 Testes

### **Estrutura de Testes**
```bash
src/
├── __tests__/          # Testes unitários
├── components/
│   └── __tests__/      # Testes de componentes
└── utils/
    └── __tests__/      # Testes de utilitários
```

### **Exemplo de Teste**
```typescript
// __tests__/useAuth.test.tsx
import { renderHook } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

describe('useAuth', () => {
  it('should return user when authenticated', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.user).toBeDefined()
    expect(result.current.loading).toBe(false)
  })
})
```

---

## 🔍 Debugging e Logs

### **Sistema de Logs**
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️ ${message}`, data)
    }
  },
  
  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`, error)
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ ${message}`, data)
  }
}

// Uso nos componentes
logger.info('Cliente carregado', { clienteId })
logger.error('Erro ao salvar cliente', error)
```

### **DevTools**
```typescript
// React Query DevTools (apenas em desenvolvimento)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <>
      <Router />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  )
}
```

---

## 📦 Dependências Principais

### **Core Dependencies**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.0.0",
  "vite": "^5.0.0"
}
```

### **UI e Styling**
```json
{
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "^1.0.0",
  "lucide-react": "^0.511.0",
  "class-variance-authority": "^0.7.1"
}
```

### **Estado e Dados**
```json
{
  "@tanstack/react-query": "^5.56.2",
  "@supabase/supabase-js": "^2.49.8",
  "react-router-dom": "^6.26.2"
}
```

### **Utilitários**
```json
{
  "date-fns": "^3.6.0",
  "zod": "^3.23.8",
  "react-hook-form": "^7.53.0"
}
```

---

## 🔧 Manutenção

### **Atualizações de Dependências**
```bash
# Verificar dependências desatualizadas
npm outdated

# Atualizar dependências menores
npm update

# Atualizar dependências maiores
npm install package@latest
```

### **Monitoramento de Performance**
```typescript
// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // Enviar métricas para serviço de analytics
  console.log(metric)
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

### **Backup e Restore**
```sql
-- Backup do banco de dados
pg_dump -h sua-url.supabase.co -U postgres -d postgres > backup.sql

-- Restore do banco de dados
psql -h sua-url.supabase.co -U postgres -d postgres < backup.sql
```

---

## 🚨 Troubleshooting

### **Problemas Comuns**

#### **Erro de Autenticação**
```typescript
// Verificar se o usuário está autenticado
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  // Redirect para login
}
```

#### **Erro de RLS**
```sql
-- Verificar políticas de segurança
SELECT * FROM pg_policies WHERE tablename = 'todos_clientes';

-- Testar acesso direto
SELECT * FROM todos_clientes WHERE email_gestor = 'teste@trafegoporcents.com';
```

#### **Performance Lenta**
```typescript
// Verificar queries desnecessárias
const { data, error } = await supabase
  .from('todos_clientes')
  .select('id, nome_cliente, status_campanha') // Apenas campos necessários
  .limit(50) // Limitar resultados
```

---

[← Anterior: Manual do Usuário](./06-manual-usuario.md) | [Próximo: Troubleshooting →](./08-troubleshooting.md)
