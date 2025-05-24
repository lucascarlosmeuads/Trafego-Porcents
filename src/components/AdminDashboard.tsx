
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { ProblemasPanel } from './ProblemasPanel'
import { GestoresManagement } from './GestoresManagement'
import { StatusFunnelDashboard } from './Dashboard/StatusFunnelDashboard'
import { ManagerSelector } from './ManagerSelector'
import { supabase } from '@/lib/supabase'

interface AdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

export function AdminDashboard({ selectedManager, onManagerSelect, activeTab }: AdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  if (loading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>
  }

  const renderContent = () => {
    // Se estiver gerenciando gestores
    if (selectedManager === '__GESTORES__') {
      return <GestoresManagement />
    }
    
    // Verificar qual aba está ativa
    if (activeTab === 'dashboard') {
      return <StatusFunnelDashboard />
    } else if (activeTab === 'problemas') {
      return <ProblemasPanel />
    } else {
      return (
        <div className="space-y-4">
          {/* Seletor de gestores - apenas quando estiver na aba de clientes e não gerenciando gestores */}
          {selectedManager !== '__GESTORES__' && selectedManager !== '__PROBLEMAS__' && (
            <div className="bg-card border rounded-lg p-4">
              <ManagerSelector 
                selectedManager={selectedManager}
                onManagerSelect={onManagerSelect}
              />
            </div>
          )}
          
          {/* Tabela de clientes */}
          <ClientesTable selectedManager={selectedManager} />
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  )
}
