
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { DashboardMetrics } from './GestorDashboard/DashboardMetrics'
import { ClientesTable } from './ClientesTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Table } from 'lucide-react'

export function GestorDashboard() {
  const { user, currentManagerName } = useAuth()
  const [loading, setLoading] = useState(true)

  const { clientes, loading: dataLoading, currentManager } = useManagerData(
    user?.email || '', 
    false, // isAdmin = false para gestores
    undefined
  )

  useEffect(() => {
    setLoading(false)
  }, [user])

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard - {currentManagerName}</h1>
          <p className="text-muted-foreground">
            Visão geral dos seus clientes e métricas
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="tabela" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Tabela de Clientes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DashboardMetrics 
            clientes={clientes} 
            currentManager={currentManager || currentManagerName}
          />
        </TabsContent>

        <TabsContent value="tabela" className="space-y-4">
          <ClientesTable selectedManager={currentManagerName} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
