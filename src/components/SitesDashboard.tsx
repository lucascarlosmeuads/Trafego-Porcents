
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Loader2 } from 'lucide-react'
import { useManagerData } from '@/hooks/useManagerData'

export function SitesDashboard() {
  const { user, currentManagerName } = useAuth()
  const { clientes, loading, refetch } = useManagerData(user?.email || '', false)

  // Filtrar apenas clientes com site_status "aguardando_link"
  const clientesAguardandoSite = clientes.filter(cliente => 
    cliente.site_status === 'aguardando_link'
  )

  useEffect(() => {
    if (clientesAguardandoSite.length > 0) {
      console.log('🌐 [SitesDashboard] Clientes aguardando site:', clientesAguardandoSite.length)
      console.log('📋 Primeiros clientes:', clientesAguardandoSite.slice(0, 3).map(c => ({ 
        nome: c.nome_cliente, 
        email: c.email_cliente,
        site_status: c.site_status 
      })))
    }
  }, [clientesAguardandoSite])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando clientes...</span>
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
            <span>Visualizando apenas clientes com status "aguardando link" no campo site</span>
          </div>
        </div>
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
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
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

      {/* Tabela de clientes - usando o componente existente */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Clientes Aguardando Sites ({clientesAguardandoSite.length})</h2>
        
        {clientesAguardandoSite.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum site pendente</h3>
              <p className="text-gray-600">
                Não há clientes aguardando criação de sites no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ClientesTable 
            selectedManager={currentManagerName} 
            filterType="sites-pendentes"
          />
        )}
      </div>
    </div>
  )
}
