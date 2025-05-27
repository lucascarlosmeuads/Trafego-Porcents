
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Loader2, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react'
import { useManagerData } from '@/hooks/useManagerData'
import { Button } from '@/components/ui/button'

export function SitesDashboard() {
  const { user, currentManagerName } = useAuth()
  const { clientes, loading, error, refetch } = useManagerData(user?.email || '', false)
  const [renderError, setRenderError] = useState<string | null>(null)

  // Validação e sanitização específica para o painel de sites
  const clientesAguardandoSite = clientes.filter(cliente => {
    try {
      // Validação básica de dados obrigatórios
      if (!cliente || typeof cliente !== 'object') {
        console.warn('⚠️ [SitesDashboard] Cliente inválido:', cliente)
        return false
      }

      if (!cliente.id || !cliente.nome_cliente) {
        console.warn('⚠️ [SitesDashboard] Cliente sem ID ou nome:', cliente.id, cliente.nome_cliente)
        return false
      }

      // Verificar se tem site_status = 'aguardando_link'
      const hasCorrectStatus = cliente.site_status === 'aguardando_link'
      
      if (hasCorrectStatus) {
        console.log('✅ [SitesDashboard] Cliente válido aguardando site:', {
          id: cliente.id,
          nome: cliente.nome_cliente,
          site_status: cliente.site_status
        })
      }
      
      return hasCorrectStatus
    } catch (filterError) {
      console.error('❌ [SitesDashboard] Erro ao filtrar cliente:', filterError, cliente)
      return false
    }
  })

  useEffect(() => {
    console.log('🌐 [SitesDashboard] === STATUS DO PAINEL ===')
    console.log('📧 Usuário:', user?.email)
    console.log('⏳ Loading:', loading)
    console.log('❌ Error:', error)
    console.log('📊 Total clientes brutos:', clientes.length)
    console.log('📊 Clientes aguardando site após filtro:', clientesAguardandoSite.length)
    
    // Reset render error when data changes
    setRenderError(null)
    
    if (clientesAguardandoSite.length > 0) {
      console.log('✅ [SitesDashboard] Clientes aguardando site carregados:', clientesAguardandoSite.length)
      console.log('📋 Primeiros 3 clientes válidos:', clientesAguardandoSite.slice(0, 3).map(c => ({ 
        id: c.id,
        nome: c.nome_cliente, 
        email: c.email_cliente,
        site_status: c.site_status,
        email_gestor: c.email_gestor
      })))
    } else if (!loading && !error) {
      console.log('ℹ️ [SitesDashboard] Nenhum cliente encontrado aguardando site')
    }
  }, [clientesAguardandoSite, loading, error, user?.email, clientes])

  // Componente de fallback simples para debugging
  const renderSimpleTable = () => (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">🚧 Modo Debug - Dados Simples</h3>
      <div className="space-y-2">
        {clientesAguardandoSite.slice(0, 10).map((cliente, index) => {
          try {
            return (
              <div key={`debug-${cliente.id}-${index}`} className="border p-2 rounded text-sm">
                <p><strong>ID:</strong> {cliente.id || 'N/A'}</p>
                <p><strong>Nome:</strong> {cliente.nome_cliente || 'N/A'}</p>
                <p><strong>Telefone:</strong> {cliente.telefone || 'N/A'}</p>
                <p><strong>Site Status:</strong> {cliente.site_status || 'N/A'}</p>
                <p><strong>Email Gestor:</strong> {cliente.email_gestor || 'N/A'}</p>
              </div>
            )
          } catch (itemError) {
            console.error('❌ [SitesDashboard] Erro ao renderizar item debug:', itemError, cliente)
            return (
              <div key={`error-${index}`} className="border border-red-300 p-2 rounded text-sm bg-red-50">
                <p className="text-red-600">❌ Erro ao renderizar cliente índice {index}</p>
              </div>
            )
          }
        })}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando dados do painel de sites...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Erro ao carregar painel: {error}</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
        </div>
        <div className="text-sm text-gray-600 text-center max-w-md">
          <p>💡 <strong>Dicas para resolver:</strong></p>
          <ul className="text-left mt-2 space-y-1">
            <li>• Verifique sua conexão com a internet</li>
            <li>• Atualize a página (F5)</li>
            <li>• Tente fazer logout e login novamente</li>
            <li>• Se o problema persistir, contate o suporte</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold header-title">Painel de Sites - {currentManagerName}</h1>
          <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
            <Globe className="w-4 h-4" />
            <span className="header-subtitle">Clientes aguardando criação de sites</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-600 mt-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
            <span>ℹ️</span>
            <span>Visualizando clientes com status "aguardando_link" no campo site_status</span>
          </div>
        </div>
        <Button 
          onClick={refetch} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Métricas do painel */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites Pendentes</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesAguardandoSite.length}</div>
            <p className="text-xs text-muted-foreground">
              Clientes aguardando criação de site
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sua Função</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Criador de Sites</div>
            <p className="text-xs text-muted-foreground">
              Responsável pela criação dos sites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativo</div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando normalmente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🌐 Instruções para Criação de Sites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold">1</div>
            <div>
              <p className="font-medium">Visualize os materiais do cliente</p>
              <p className="text-sm text-gray-600">Use o botão "Ver materiais" para acessar arquivos e briefing</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold">2</div>
            <div>
              <p className="font-medium">Entre em contato via WhatsApp</p>
              <p className="text-sm text-gray-600">Use o botão verde do WhatsApp para esclarecer dúvidas</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold">3</div>
            <div>
              <p className="font-medium">Adicione o link do site finalizado</p>
              <p className="text-sm text-gray-600">Quando o site estiver pronto, edite o campo "Site" na tabela</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de clientes - com tratamento de erro */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Clientes Aguardando Sites ({clientesAguardandoSite.length})</h2>
        
        {clientesAguardandoSite.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum site pendente</h3>
              <p className="text-gray-600 mb-4">
                Não há clientes aguardando criação de sites no momento.
              </p>
              <Button onClick={refetch} variant="outline" className="flex items-center gap-2 mx-auto">
                <RefreshCw className="w-4 h-4" />
                Verificar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Modo Debug Toggle */}
            {renderError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Erro de Renderização Detectado</span>
                </div>
                <p className="text-sm text-red-700 mb-3">{renderError}</p>
                <Button 
                  onClick={() => setRenderError(null)} 
                  variant="outline" 
                  size="sm"
                  className="text-red-700 border-red-300"
                >
                  Tentar Renderização Normal
                </Button>
              </div>
            )}

            {/* Renderização da tabela com fallback */}
            {renderError ? (
              renderSimpleTable()
            ) : (
              <div className="bg-white rounded-lg shadow">
                <ErrorBoundary 
                  onError={(error) => {
                    console.error('❌ [SitesDashboard] Erro na tabela:', error)
                    setRenderError(error.message)
                  }}
                >
                  <ClientesTable 
                    selectedManager={currentManagerName} 
                    filterType="sites-pendentes"
                  />
                </ErrorBoundary>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente Error Boundary simples
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-300 rounded bg-red-50 text-center">
          <p className="text-red-700">❌ Erro ao renderizar tabela. Tente o modo debug acima.</p>
        </div>
      )
    }

    return this.props.children
  }
}
