
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { StatusVisualization } from './ClienteDashboard/StatusVisualization'
import { BriefingForm } from './ClienteDashboard/BriefingForm'
import { VendasManager } from './ClienteDashboard/VendasManager'
import { ArquivosUpload } from './ClienteDashboard/ArquivosUpload'
import { ClienteDashboardMetrics } from './ClienteDashboard/ClienteDashboardMetrics'
import { TutorialVideos } from './ClienteDashboard/TutorialVideos'
import { useClienteData } from '@/hooks/useClienteData'

export function ClienteDashboard() {
  const { user } = useAuth()
  const { cliente, briefing, vendas, arquivos, loading, refetch } = useClienteData(user?.email || '')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Carregando seus dados...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minha Campanha</h1>
          <p className="text-muted-foreground">Acompanhe o progresso da sua campanha de tráfego</p>
          {cliente && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{cliente.nome_cliente}</Badge>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="status">📊 Status</TabsTrigger>
          <TabsTrigger value="briefing">📝 Briefing</TabsTrigger>
          <TabsTrigger value="materiais">📁 Materiais</TabsTrigger>
          <TabsTrigger value="vendas">💰 Vendas</TabsTrigger>
          <TabsTrigger value="dashboard">📈 Dashboard</TabsTrigger>
          <TabsTrigger value="tutorial">🎓 Tutorial</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <StatusVisualization cliente={cliente} />
        </TabsContent>

        <TabsContent value="briefing" className="space-y-6">
          <BriefingForm 
            briefing={briefing} 
            emailCliente={user?.email || ''} 
            onBriefingUpdated={refetch}
          />
        </TabsContent>

        <TabsContent value="materiais" className="space-y-6">
          <ArquivosUpload 
            emailCliente={user?.email || ''} 
            arquivos={arquivos}
            onArquivosUpdated={refetch}
          />
        </TabsContent>

        <TabsContent value="vendas" className="space-y-6">
          <VendasManager 
            emailCliente={user?.email || ''} 
            vendas={vendas}
            onVendasUpdated={refetch}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <ClienteDashboardMetrics 
            cliente={cliente}
            briefing={briefing}
            vendas={vendas}
            arquivos={arquivos}
          />
        </TabsContent>

        <TabsContent value="tutorial" className="space-y-6">
          <TutorialVideos />
        </TabsContent>
      </Tabs>
    </div>
  )
}
