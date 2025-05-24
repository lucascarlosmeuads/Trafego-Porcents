
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { DashboardMetrics } from './GestorDashboard/DashboardMetrics'
import { ProblemasPanel } from './ProblemasPanel'
import { useManagerData } from '@/hooks/useManagerData'
import { useGestorPermissions } from '@/hooks/useGestorPermissions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddClientModal } from './ClientesTable/AddClientModal'

export function GestorDashboard() {
  const { user, currentManagerName, isAdmin } = useAuth()
  const { clientes, loading, refetch } = useManagerData(user?.email || '', false)
  const { canAddClients, loading: permissionsLoading } = useGestorPermissions()

  // Separar clientes por status
  const clientesAtivos = clientes.filter(cliente => 
    cliente.status_campanha !== 'Off' && 
    cliente.status_campanha !== 'Reembolso' && 
    cliente.status_campanha !== 'Problema'
  )
  
  const clientesInativos = clientes.filter(cliente => 
    cliente.status_campanha === 'Off' || cliente.status_campanha === 'Reembolso'
  )

  const clientesProblemas = clientes.filter(cliente => 
    cliente.status_campanha === 'Problema'
  )

  // Log de segurança para verificar se o filtro está funcionando
  useEffect(() => {
    if (clientes.length > 0 && user?.email && !isAdmin) {
      console.log('🔍 [GestorDashboard] Verificação de segurança:')
      console.log('👤 Email do usuário logado:', user.email)
      console.log('📊 Total de clientes carregados:', clientes.length)
      
      const clientesComEmailIncorreto = clientes.filter(c => c.email_gestor !== user.email)
      if (clientesComEmailIncorreto.length > 0) {
        console.error('🚨 [GestorDashboard] ERRO DE SEGURANÇA: Clientes com email_gestor incorreto!', clientesComEmailIncorreto)
      } else {
        console.log('✅ [GestorDashboard] Todos os clientes pertencem ao gestor correto')
      }
      
      // Verificar distribuição de emails
      const emailDistribution = clientes.reduce((acc, cliente) => {
        acc[cliente.email_gestor] = (acc[cliente.email_gestor] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      console.log('📈 [GestorDashboard] Distribuição por email_gestor:', emailDistribution)
    }
  }, [clientes, user?.email, isAdmin])

  if (loading || permissionsLoading) {
    return <div className="flex items-center justify-center py-8 text-contrast">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold header-title">Dashboard - {currentManagerName}</h1>
          {!isAdmin && (
            <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="header-subtitle">🔒 Filtro de Segurança Ativo - Dados filtrados por: {user?.email}</span>
            </div>
          )}
        </div>
        
        {canAddClients && (
          <div className="flex items-center gap-2">
            <AddClientModal 
              selectedManager={currentManagerName} 
              onClienteAdicionado={refetch}
            />
            <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded badge-contrast">
              ✅ Pode adicionar clientes
            </span>
          </div>
        )}
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="dashboard" className="text-contrast-secondary data-[state=active]:text-contrast data-[state=active]:bg-background">📊 Dashboard</TabsTrigger>
          <TabsTrigger value="clientes" className="text-contrast-secondary data-[state=active]:text-contrast data-[state=active]:bg-background">📋 Clientes Ativos ({clientesAtivos.length})</TabsTrigger>
          <TabsTrigger value="problemas" className="text-contrast-secondary data-[state=active]:text-contrast data-[state=active]:bg-background">⚠️ Problemas ({clientesProblemas.length})</TabsTrigger>
          <TabsTrigger value="inativos" className="text-contrast-secondary data-[state=active]:text-contrast data-[state=active]:bg-background">📋 Inativos ({clientesInativos.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <DashboardMetrics clientes={clientes} />
        </TabsContent>
        
        <TabsContent value="clientes" className="space-y-6">
          <ClientesTable selectedManager={currentManagerName} filterType="ativos" />
        </TabsContent>

        <TabsContent value="problemas" className="space-y-6">
          <ProblemasPanel gestorMode={true} />
        </TabsContent>

        <TabsContent value="inativos" className="space-y-6">
          <ClientesTable selectedManager={currentManagerName} filterType="inativos" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
