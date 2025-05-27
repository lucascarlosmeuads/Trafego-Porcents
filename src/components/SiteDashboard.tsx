
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { useManagerData } from '@/hooks/useManagerData'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SiteDashboard() {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)

  // Use the existing useManagerData hook to get all clients
  const { clientes, loading: dataLoading, refetch } = useManagerData(
    user?.email || '', 
    true, // Act as admin to see all clients
    null // No specific manager filter
  )

  // Filter clients where site_status is "aguardando_link"
  const clientesAguardandoSite = clientes.filter(cliente => 
    cliente.site_status === 'aguardando_link'
  )

  useEffect(() => {
    if (user) {
      setLoading(false)
    }
  }, [user])

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center py-8 text-contrast">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold header-title">Painel de Sites</h1>
          <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="header-subtitle">🌐 Clientes aguardando criação de site</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-600 mt-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
            <span>⚠️</span>
            <span>Apenas clientes com status "Aguardando link" são exibidos aqui.</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sites-pendentes" className="w-full">
        <TabsList className="grid w-full grid-cols-1 bg-muted">
          <TabsTrigger value="sites-pendentes" className="text-contrast-secondary data-[state=active]:text-contrast data-[state=active]:bg-background">
            🌐 Sites Pendentes ({clientesAguardandoSite.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sites-pendentes" className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <span className="text-lg">🎯</span>
              <div>
                <h3 className="font-semibold">Instruções para Criadores de Sites</h3>
                <p className="text-sm mt-1">
                  1. Use o botão "Ver materiais" para acessar arquivos enviados pelo cliente<br/>
                  2. Use o botão "Ver briefing" para ver as informações do projeto<br/>
                  3. Entre em contato via WhatsApp se necessário<br/>
                  4. Ao finalizar o site, clique no ícone de edição na coluna "Site" e cole o link do site pronto
                </p>
              </div>
            </div>
          </div>
          
          <SiteClientesTable clientes={clientesAguardandoSite} onUpdate={refetch} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
