
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ManagerSidebar } from '@/components/ManagerSidebar'
import { ClientesTable } from '@/components/ClientesTable'
import { AdicionarClienteModal } from '@/components/AdicionarClienteModal'
import { BriefingsPanel } from '@/components/BriefingsPanel'
import { ChatLayoutSplit } from '@/components/Chat/ChatLayoutSplit'
import { GestorSacDashboard } from '@/components/SAC/GestorSacDashboard'
import { SugestoesDashboard } from '@/components/Sugestoes/SugestoesDashboard'
import { ProfileSettings } from '@/components/ProfileSettings'
import { DashboardMetrics } from '@/components/GestorDashboard/DashboardMetrics'
import { OptimizedGestorDashboard } from '@/components/GestorDashboard/OptimizedGestorDashboard'
import { useOptimizedComponents } from '@/hooks/useOptimizedComponents'
import { BookOpen, HelpCircle } from 'lucide-react'

export function GestorDashboard() {
  const [activeView, setActiveView] = useState('dashboard')
  const { shouldUseOptimized } = useOptimizedComponents()

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return shouldUseOptimized ? <OptimizedGestorDashboard /> : <DashboardMetrics />
      case 'clientes':
        return <ClientesTable />
      case 'adicionar':
        return <AdicionarClienteModal isOpen={true} onClose={() => setActiveView('clientes')} />
      case 'briefings':
        return <BriefingsPanel />
      case 'chat':
        return <ChatLayoutSplit />
      case 'sac-gestor':
        return <GestorSacDashboard />
      case 'sugestoes':
        return <SugestoesDashboard />
      case 'perfil':
        return <ProfileSettings />
      case 'suporte':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <HelpCircle className="h-8 w-8 text-blue-500" />
                Central de Suporte
              </h1>
              <p className="text-gray-600 mt-2">
                Encontre ajuda e documentação do sistema
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Documentação
                </CardTitle>
                <CardDescription>
                  Acesse guias e manuais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Em breve: documentação completa, tutoriais em vídeo e FAQ.
                </p>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return shouldUseOptimized ? <OptimizedGestorDashboard /> : <DashboardMetrics />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ManagerSidebar 
        activeView={activeView} 
        onViewChange={setActiveView}
        userType="gestor"
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
