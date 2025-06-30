
import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { useComissaoFilters } from '@/hooks/useComissaoFilters'
import { ComissaoMetrics } from './ComissaoMetrics'
import { DashboardRefreshButton } from './DashboardRefreshButton'
import { ClientesTable } from '../ClientesTable'
import { ManagerSelector } from '../ManagerSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface EnhancedAdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
}

export function EnhancedAdminDashboard({ selectedManager, onManagerSelect }: EnhancedAdminDashboardProps) {
  const { user } = useAuth()
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  
  // Buscar dados dos clientes baseado no gestor selecionado
  const { clientes: gestorClientes, loading: clientesLoading, refetch } = useManagerData(
    user?.email || '', // userEmail: email do admin atual
    true, // isAdminUser: true para admin
    selectedManager === '__GESTORES__' ? '' : selectedManager, // selectedManager
  )

  // Hook para filtros de comissão
  const { selectedFilter, setSelectedFilter, clientesFiltrados } = useComissaoFilters(gestorClientes)

  console.log('🔍 [EnhancedAdminDashboard] === DEBUG ENHANCED ADMIN DASHBOARD ===')
  console.log('👤 [EnhancedAdminDashboard] Admin user email:', user?.email)
  console.log('🎯 [EnhancedAdminDashboard] Selected manager:', selectedManager)
  console.log('📊 [EnhancedAdminDashboard] Clientes encontrados:', gestorClientes.length)
  console.log('🔧 [EnhancedAdminDashboard] Filtro selecionado:', selectedFilter)
  console.log('📋 [EnhancedAdminDashboard] Clientes filtrados:', clientesFiltrados.length)

  const handleRefresh = useCallback(async () => {
    console.log('🔄 [EnhancedAdminDashboard] Iniciando atualização do dashboard...')
    
    try {
      // Refetch dos dados principais
      if (refetch) {
        await refetch()
      }
      
      // Atualizar timestamp
      setLastUpdated(new Date())
      
      console.log('✅ [EnhancedAdminDashboard] Dashboard atualizado com sucesso!')
      
    } catch (error) {
      console.error('❌ [EnhancedAdminDashboard] Erro ao atualizar dashboard:', error)
      throw error
    }
  }, [refetch])

  if (clientesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header com botão de atualização */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Dashboard Administrativo - Controle de Comissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardRefreshButton 
              onRefresh={handleRefresh}
              lastUpdated={lastUpdated}
            />
          </CardContent>
        </Card>

        {/* Seletor de gestores */}
        <Card>
          <CardContent className="p-4">
            <ManagerSelector 
              selectedManager={selectedManager}
              onManagerSelect={onManagerSelect}
              isAdminContext={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Comissão */}
      <ComissaoMetrics 
        clientes={gestorClientes}
        onFilterChange={setSelectedFilter}
        selectedFilter={selectedFilter}
      />

      {/* Tabela de Clientes Filtrada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              📋 Lista de Clientes
              {selectedFilter !== 'todos' && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  (Filtro: {selectedFilter})
                </span>
              )}
            </span>
            <span className="text-sm font-normal text-gray-600">
              {clientesFiltrados.length} de {gestorClientes.length} clientes
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <ClientesTable 
              selectedManager={selectedManager} 
              initialClientes={clientesFiltrados}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
