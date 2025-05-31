
import { Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { DashboardMetrics } from './GestorDashboard/DashboardMetrics'
import { SolicitacoesSaque } from './SolicitacoesSaque'
import { LoadingFallback } from './LoadingFallback'
import * as LazyComponents from './LazyComponents'

interface GestorDashboardProps {
  activeTab: string
}

export default function GestorDashboard({ activeTab }: GestorDashboardProps) {
  const { user } = useAuth()
  const { clientes, loading } = useManagerData(user?.email || '')

  const renderContent = () => {
    if (loading) {
      return <LoadingFallback message="Carregando dados..." />
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardMetrics clientes={clientes} />
      case 'clientes':
        return (
          <Suspense fallback={<LoadingFallback message="Carregando tabela de clientes..." />}>
            <LazyComponents.ClientesTable />
          </Suspense>
        )
      case 'saques':
        return <SolicitacoesSaque />
      case 'chat':
        return (
          <Suspense fallback={<LoadingFallback message="Carregando chat..." />}>
            <LazyComponents.ChatLayoutSplit />
          </Suspense>
        )
      default:
        return <DashboardMetrics clientes={clientes} />
    }
  }

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  )
}
