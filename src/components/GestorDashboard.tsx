
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { DashboardMetrics } from './GestorDashboard/DashboardMetrics'
import { useManagerData } from '@/hooks/useManagerData'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function GestorDashboard() {
  const { user, currentManagerName } = useAuth()
  const { clientes, loading } = useManagerData(user?.email || '', false)

  if (loading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard - {currentManagerName}</h1>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
          <TabsTrigger value="clientes">📋 Tabela de Clientes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <DashboardMetrics clientes={clientes} />
        </TabsContent>
        
        <TabsContent value="clientes" className="space-y-6">
          <ClientesTable selectedManager={currentManagerName} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
