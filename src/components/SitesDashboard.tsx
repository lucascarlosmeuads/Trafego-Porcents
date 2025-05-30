
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useManagerData } from '@/hooks/useManagerData'

export function SitesDashboard() {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('pendentes')

  // Buscar dados para estatísticas
  const { clientes: clientesPendentes, loading: loadingPendentes } = useManagerData(
    user?.email || '', 
    isAdmin, 
    null, 
    'sites-pendentes'
  )
  
  const { clientes: clientesFinalizados, loading: loadingFinalizados } = useManagerData(
    user?.email || '', 
    isAdmin, 
    null, 
    'sites-finalizados'
  )

  const loading = loadingPendentes || loadingFinalizados

  if (loading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Painel de Criação de Sites</h1>
        <p className="text-muted-foreground">Gerencie os sites dos clientes</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites Pendentes</CardTitle>
            <div className="h-4 w-4 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesPendentes.length}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando criação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites Finalizados</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesFinalizados.length}</div>
            <p className="text-xs text-muted-foreground">
              Já entregues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visões */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pendentes">Sites Pendentes ({clientesPendentes.length})</TabsTrigger>
          <TabsTrigger value="finalizados">Sites Finalizados ({clientesFinalizados.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pendentes" className="space-y-4">
          <ClientesTable 
            userEmail={user?.email || ''} 
            isAdmin={isAdmin} 
            filterType="sites-pendentes" 
          />
        </TabsContent>
        
        <TabsContent value="finalizados" className="space-y-4">
          <ClientesTable 
            userEmail={user?.email || ''} 
            isAdmin={isAdmin} 
            filterType="sites-finalizados" 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
