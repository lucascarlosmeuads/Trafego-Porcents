
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { GestoresManagement } from './GestoresManagement'
import { StatusFunnelDashboard } from './Dashboard/StatusFunnelDashboard'
import { DocumentationViewer } from './Documentation'
import { ManagerSelector } from './ManagerSelector'
import { supabase } from '@/lib/supabase'
import { AdminChatLayoutSplit } from './Chat/AdminChatLayoutSplit'

// Imports comentados para componentes não utilizados:
// import { AuditoriaClientes } from './AuditoriaClientes'
// import { BriefingsPanel } from './BriefingsPanel'
// import { ImportarVendasManuais } from './ImportarVendasManuais'
// import { ClientUserCreation } from './ClientUserCreation'

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

      case 'documentacao':
        return <DocumentationViewer />

      case 'chat':
        return <AdminChatLayoutSplit />

      // Cases comentados para menus ocultos (mantidos para não quebrar funcionalidade):
      /*
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
            <ClientesTable filterType="sites-pendentes" />
          </div>
        )
      */
      
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
            
            {/* Admin panel: Pass selectedManager directly for proper filtering */}
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
