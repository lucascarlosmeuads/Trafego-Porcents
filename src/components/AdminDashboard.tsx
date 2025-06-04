
import { useState } from 'react'
import { ManagerSidebar } from '@/components/ManagerSidebar'
import { ClientesTable } from '@/components/ClientesTable'
import { GestoresManagement } from '@/components/GestoresManagement'
import { AdminChatLayoutSplit } from '@/components/Chat/AdminChatLayoutSplit'
import { SacDashboard } from '@/components/SAC/SacDashboard'
import { AdminSugestoes } from '@/components/Sugestoes/AdminSugestoes'
import { SitesDashboard } from '@/components/SitesDashboard'
import { DocumentationViewer } from '@/components/Documentation/DocumentationViewer'
import { StatusFunnelDashboard } from '@/components/Dashboard/StatusFunnelDashboard'
import { AdminDashboardMetrics } from '@/components/AdminDashboard/AdminDashboardMetrics'
import { OptimizedAdminDashboard } from '@/components/AdminDashboard/OptimizedAdminDashboard'
import { useOptimizedComponents } from '@/hooks/useOptimizedComponents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, FileText } from 'lucide-react'

export function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard')
  const { shouldUseOptimized } = useOptimizedComponents()

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return shouldUseOptimized ? <OptimizedAdminDashboard /> : <AdminDashboardMetrics />
      case 'clientes':
        return <ClientesTable />
      case 'gestores':
        return <GestoresManagement />
      case 'chat-admin':
        return <AdminChatLayoutSplit />
      case 'sac':
        return <SacDashboard />
      case 'sugestoes':
        return <AdminSugestoes />
      case 'relatorios':
        return <StatusFunnelDashboard />
      case 'sites':
        return <SitesDashboard />
      case 'documentacao':
        return <DocumentationViewer />
      case 'configuracoes':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="h-8 w-8 text-gray-600" />
                Configurações do Sistema
              </h1>
              <p className="text-gray-600 mt-2">
                Configurações gerais e parâmetros do sistema
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configurações básicas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Em breve: configurações de sistema, parâmetros globais e customizações.
                </p>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return shouldUseOptimized ? <OptimizedAdminDashboard /> : <AdminDashboardMetrics />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ManagerSidebar 
        activeView={activeView} 
        onViewChange={setActiveView}
        userType="admin"
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
