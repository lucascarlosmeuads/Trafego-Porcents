
import { useState, useEffect, Suspense, memo, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from '../ClientesTable'
import { GestoresManagement } from '../GestoresManagement'
import { AdminDashboardMetrics } from './AdminDashboardMetrics'
import { LazyStatusFunnelDashboard, LazyDocumentationViewer, LazyGeradorCriativos } from '../LazyComponents'
import { LoadingFallback } from '../LoadingFallback'
import { ManagerSelector } from '../ManagerSelector'
import { useManagerData } from '@/hooks/useManagerData'
import { SacDashboard } from '../SAC/SacDashboard'

interface AdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

// Optimize AdminDashboard with React.memo
export const OptimizedAdminDashboard = memo(function OptimizedAdminDashboard({ 
  selectedManager, 
  onManagerSelect, 
  activeTab 
}: AdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // Memoize manager data parameters to prevent unnecessary re-renders
  const managerDataParams = useMemo(() => ({
    userEmail: user?.email || '',
    isAdminUser: true,
    selectedManager: selectedManager === '__GESTORES__' ? '' : selectedManager,
  }), [user?.email, selectedManager])

  const { clientes: gestorClientes, loading: clientesLoading } = useManagerData(
    managerDataParams.userEmail,
    managerDataParams.isAdminUser,
    managerDataParams.selectedManager,
  )

  console.log('🔍 [OptimizedAdminDashboard] === DEBUG ADMIN DASHBOARD OTIMIZADO ===')
  console.log('👤 [OptimizedAdminDashboard] Admin user email:', user?.email)
  console.log('🎯 [OptimizedAdminDashboard] Selected manager:', selectedManager)
  console.log('📊 [OptimizedAdminDashboard] Clientes encontrados:', gestorClientes.length)
  console.log('⏳ [OptimizedAdminDashboard] Loading clientes:', clientesLoading)
  console.log('🎯 [OptimizedAdminDashboard] ACTIVE TAB RECEBIDO:', `"${activeTab}"`)
  console.log('🔍 [OptimizedAdminDashboard] Verificando qual case será executado...')

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  // Memoize callbacks to prevent child re-renders
  const handleManagerSelect = useCallback((manager: string | null) => {
    onManagerSelect(manager)
  }, [onManagerSelect])

  // Memoize expensive content rendering
  const renderedContent = useMemo(() => {
    // Gerenciamento de gestores
    if (selectedManager === '__GESTORES__') {
      return <GestoresManagement />
    }
    
    // Navegação por abas
    console.log('🔄 [OptimizedAdminDashboard] Entrando no switch com activeTab:', `"${activeTab}"`)
    switch (activeTab) {
      case 'dashboard':
        console.log('✅ [OptimizedAdminDashboard] CASE: dashboard')
        return (
          <div className="space-y-6">
            {/* Seletor de gestores */}
            <div className="bg-card border rounded-lg p-4">
              <ManagerSelector 
                selectedManager={selectedManager}
                onManagerSelect={handleManagerSelect}
                isAdminContext={true}
              />
            </div>
            
            {/* Métricas do Admin - Memoized */}
            <AdminDashboardMetrics 
              clientes={gestorClientes} 
              selectedManager={selectedManager}
            />
          </div>
        )

      case 'gerador-criativos':
        console.log('✅ [OptimizedAdminDashboard] CASE: gerador-criativos - RENDERIZANDO GERADOR!')
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyGeradorCriativos />
          </Suspense>
        )

      case 'sac':
        console.log('✅ [OptimizedAdminDashboard] CASE: sac')
        return <SacDashboard />

      case 'documentacao':
        console.log('✅ [OptimizedAdminDashboard] CASE: documentacao')
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyDocumentationViewer />
          </Suspense>
        )
      
      case 'clientes':
      default:
        console.log('❌ [OptimizedAdminDashboard] CASE: default/clientes - activeTab era:', `"${activeTab}"`)
        return (
          <div className="space-y-4 w-full">
            {/* Seletor de gestores apenas quando não estiver gerenciando gestores */}
            {selectedManager !== '__GESTORES__' && (
              <div className="bg-card border rounded-lg p-4">
                <ManagerSelector 
                  selectedManager={selectedManager}
                  onManagerSelect={handleManagerSelect}
                  isAdminContext={true}
                />
              </div>
            )}
            
            {/* Admin panel: Pass selectedManager directly for proper filtering */}
            <div className="w-full">
              <ClientesTable selectedManager={selectedManager} />
            </div>
          </div>
        )
    }
  }, [selectedManager, activeTab, gestorClientes, handleManagerSelect])

  if (loading) {
    return <LoadingFallback />
  }

  return (
    <div className="w-full">
      {renderedContent}
    </div>
  )
})

// Add default export for lazy loading
export default OptimizedAdminDashboard
