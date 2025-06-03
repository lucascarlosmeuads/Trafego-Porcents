
import { useState, memo, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { ClientesTable } from '../ClientesTable'
import { GamifiedMetrics } from './GamifiedMetrics'
import { ChatLayoutSplit } from '../Chat/ChatLayoutSplit'

interface GestorDashboardProps {
  activeTab: string
}

// Optimize GestorDashboard with React.memo
export const OptimizedGestorDashboard = memo(function OptimizedGestorDashboard({ 
  activeTab 
}: GestorDashboardProps) {
  const { user } = useAuth()
  
  // Memoize user email to prevent unnecessary data refetches
  const userEmail = useMemo(() => user?.email || '', [user?.email])
  
  const { clientes, loading } = useManagerData(userEmail)

  // Memoize expensive calculations
  const clientesCount = useMemo(() => clientes.length, [clientes.length])

  console.log('🔍 [OptimizedGestorDashboard] === DEBUG GESTOR DASHBOARD OTIMIZADO ===')
  console.log('👤 [OptimizedGestorDashboard] User email:', userEmail)
  console.log('📊 [OptimizedGestorDashboard] Total clientes:', clientesCount)
  console.log('⏳ [OptimizedGestorDashboard] Loading:', loading)

  // Memoize loading component to prevent re-renders
  const loadingComponent = useMemo(() => (
    <div className="flex items-center justify-center h-64 bg-gray-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
        <p className="text-gray-300">Carregando dados...</p>
      </div>
    </div>
  ), [])

  // Memoize content rendering to prevent unnecessary re-renders
  const renderedContent = useMemo(() => {
    if (loading) {
      return loadingComponent
    }

    switch (activeTab) {
      case 'dashboard':
        return <GamifiedMetrics clientes={clientes} />
      case 'clientes':
        return (
          <div className="bg-gray-950 min-h-screen">
            <ClientesTable />
          </div>
        )
      case 'chat':
        return (
          <div className="bg-gray-950 min-h-screen">
            <ChatLayoutSplit />
          </div>
        )
      default:
        return <GamifiedMetrics clientes={clientes} />
    }
  }, [activeTab, clientes, loading, loadingComponent])

  return (
    <div className="bg-gray-950 min-h-screen">
      {renderedContent}
    </div>
  )
})

// Add default export for lazy loading
export default OptimizedGestorDashboard
