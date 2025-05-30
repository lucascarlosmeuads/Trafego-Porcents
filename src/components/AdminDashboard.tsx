
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { ProblemasPanel } from './ProblemasPanel'
import { GestoresManagement } from './GestoresManagement'
import { StatusFunnelDashboard } from './Dashboard/StatusFunnelDashboard'
import { AuditoriaClientes } from './AuditoriaClientes'
import { BriefingsPanel } from './BriefingsPanel'
import { ManagerSelector } from './ManagerSelector'
import { ImportarVendasManuais } from './ImportarVendasManuais'
import { ClientUserCreation } from './ClientUserCreation'
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
    // Gerenciamento de gestores
    if (selectedManager === '__GESTORES__') {
      return <GestoresManagement />
    }
    
    // Navegação por abas
    switch (activeTab) {
      case 'dashboard':
        return <StatusFunnelDashboard />
      
      case 'problemas':
        return <ProblemasPanel />

      case 'auditoria':
        return <AuditoriaClientes />

      case 'briefings':
        return <BriefingsPanel />

      case 'importar-vendas':
        return <ImportarVendasManuais />

      case 'criar-usuarios-clientes':
        return <ClientUserCreation />

      case 'sites':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Painel de Criação de Sites</h2>
            <ClientesTable 
              userEmail={user?.email || ''} 
              isAdmin={isAdmin} 
              filterType="sites-pendentes" 
            />
          </div>
        )

      case 'saques-pendentes':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Saques Pendentes</h2>
            <ClientesTable 
              userEmail={user?.email || ''} 
              isAdmin={isAdmin} 
              filterType="saques-pendentes" 
            />
          </div>
        )
      
      case 'clientes':
      default:
        return (
          <div className="space-y-4">
            {/* Seletor de gestores apenas quando não estiver gerenciando gestores */}
            {selectedManager !== '__GESTORES__' && (
              <div className="bg-card border rounded-lg p-4">
                <ManagerSelector 
                  selectedManager={selectedManager}
                  onManagerSelect={onManagerSelect}
                  isAdminContext={true}
                />
              </div>
            )}
            
            <ClientesTable 
              userEmail={user?.email || ''} 
              isAdmin={isAdmin} 
              selectedManager={selectedManager} 
            />
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
