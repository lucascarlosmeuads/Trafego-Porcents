
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { ClientesTable } from './ClientesTable'
import { GamifiedMetrics } from './GestorDashboard/GamifiedMetrics'
import { ChatLayoutSplit } from './Chat/ChatLayoutSplit'
import { useOptimizedComponents } from '@/hooks/useOptimizedComponents'

interface GestorDashboardProps {
  activeTab: string
}

export function GestorDashboard({ activeTab }: GestorDashboardProps) {
  const { user } = useAuth()
  const { clientes, loading } = useManagerData(user?.email || '')
  const { useOptimized } = useOptimizedComponents()

  console.log('🔍 [GestorDashboard] === DEBUG GESTOR DASHBOARD ===')
  console.log('👤 [GestorDashboard] User email:', user?.email)
  console.log('📊 [GestorDashboard] Total clientes:', clientes.length)
  console.log('⏳ [GestorDashboard] Loading:', loading)
  console.log('⚡ [GestorDashboard] Usando componentes otimizados:', useOptimized)

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-950">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
            <p className="text-gray-300">Carregando dados...</p>
          </div>
        </div>
      )
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
  }

  return (
    <div className="bg-gray-950 min-h-screen">
      {renderContent()}
    </div>
  )
}

// Add default export for lazy loading
export default GestorDashboard
