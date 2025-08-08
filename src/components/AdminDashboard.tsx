
import { useState, useEffect, Suspense, useMemo, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { GestoresManagement } from './GestoresManagement'
import { AdminDashboardMetrics } from './AdminDashboard/AdminDashboardMetrics'

import { LazyStatusFunnelDashboard, LazyDocumentationViewer, LazyAcervoIdeasDashboard } from './LazyComponents'
import { LoadingFallback } from './LoadingFallback'
import { ManagerSelector } from './ManagerSelector'
import { useManagerData } from '@/hooks/useManagerData'
import { SacDashboard } from './SAC/SacDashboard'
import { LazyRelatorioSacGestores } from './LazyComponents'
import { AdminSugestoes } from './AdminSugestoes'
import { SiteRequestsDashboard } from './SiteRequests/SiteRequestsDashboard'
import { MaxIntegrationDashboard } from './MaxIntegration/MaxIntegrationDashboard'
import { OpenAICustosDashboard } from './AdminDashboard/OpenAICustosDashboard'
import GeradorCriativosDashboardNew from './GeradorCriativos/GeradorCriativosDashboardNew'
import { IdeiasDashboard } from './AcervoIdeias/IdeiasDashboard'
import { LeadsParcerriaPanel } from './LeadsParceria/LeadsParcerriaPanel'
import { ErrorBoundary } from './ErrorBoundary'
import { DateRangeFilter } from './DateRangeFilter'

import { useLeadsAnalytics } from '@/hooks/useLeadsAnalytics'
import { useAdminMetaAds } from '@/hooks/useAdminMetaAds'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, Users as UsersIcon, PieChart, RefreshCw } from 'lucide-react'


interface AdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AdminDashboard({ selectedManager, onManagerSelect, activeTab, onTabChange }: AdminDashboardProps) {
  // CORREÇÃO: Todos os hooks devem ser chamados PRIMEIRO, sem condições
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dashboardFilter, setDashboardFilter] = useState<{ startDate?: string; endDate?: string; option?: string }>({ option: 'hoje' })
  const [appliedFilter, setAppliedFilter] = useState<{ startDate?: string; endDate?: string; option?: string }>({ option: 'hoje' })
  const stableAppliedFilter = useMemo(() => ({
    startDate: appliedFilter.startDate,
    endDate: appliedFilter.endDate,
    option: appliedFilter.option
  }), [appliedFilter.startDate, appliedFilter.endDate, appliedFilter.option])
  const { todayStats, filteredStats } = useLeadsAnalytics(stableAppliedFilter)
  const analyticsBase = filteredStats || todayStats
  const totalLeadsCount = analyticsBase?.total || 0
  const convertedLeadsCount = analyticsBase?.converted || 0
  const conversionRate = analyticsBase?.conversionRate || 0

  const { insights, fetchingInsights, isConfigured, lastError, fetchTodayInsights, fetchInsightsWithPeriod } = useAdminMetaAds()
  const spend = insights ? parseFloat(insights.spend || '0') : 0
  const lastMetaKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isConfigured) return

    const key = `${stableAppliedFilter.option ?? 'hoje'}|${stableAppliedFilter.startDate ?? ''}|${stableAppliedFilter.endDate ?? ''}`
    if (lastMetaKeyRef.current === key) return
    lastMetaKeyRef.current = key

    switch (stableAppliedFilter.option) {
      case 'hoje':
      case undefined:
      case null:
        fetchTodayInsights()
        break
      case 'ontem':
        fetchInsightsWithPeriod('yesterday')
        break
      case 'ultimos_7_dias':
        fetchInsightsWithPeriod('last_7_days')
        break
      case 'ultimos_30_dias':
        fetchInsightsWithPeriod('last_30_days')
        break
      case 'anteontem':
      case 'total':
      case 'personalizado':
        if (stableAppliedFilter.startDate && stableAppliedFilter.endDate) {
          fetchInsightsWithPeriod('custom', stableAppliedFilter.startDate, stableAppliedFilter.endDate)
        }
        break
      default:
        fetchTodayInsights()
    }
  }, [isConfigured, stableAppliedFilter.option, stableAppliedFilter.startDate, stableAppliedFilter.endDate])
  // Buscar dados dos clientes - sempre chamar o hook
  const { clientes: gestorClientes, loading: clientesLoading } = useManagerData(
    user?.email || 'fallback@example.com', 
    true, 
    selectedManager === '__GESTORES__' ? '' : selectedManager
  )

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  console.log('🔍 [AdminDashboard] === DEBUG ADMIN DASHBOARD ===')
  console.log('👤 [AdminDashboard] Admin user email:', user?.email)
  console.log('🎯 [AdminDashboard] Selected manager:', selectedManager)
  console.log('📊 [AdminDashboard] Clientes encontrados:', gestorClientes.length)
  console.log('⏳ [AdminDashboard] Loading clientes:', clientesLoading)

  // Renderizar loading apenas se user/isAdmin ainda não estiverem carregados
  if (loading || !user || !isAdmin) {
    return <LoadingFallback />
  }

  const renderContent = () => {
    // Gerenciamento de gestores
    if (selectedManager === '__GESTORES__') {
      return <GestoresManagement />
    }
    
    // Navegação por abas
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Filtro de Data */}
            <div className="bg-card border rounded-lg p-4">
              <DateRangeFilter onFilterChange={(start, end, option) => setDashboardFilter({ startDate: start, endDate: end, option })} />
            </div>

            <div className="flex justify-end -mt-2">
              <Button onClick={() => setAppliedFilter(dashboardFilter)} disabled={fetchingInsights} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${fetchingInsights ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {/* Cards Resumidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Investimento Meta Ads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(spend)}</div>
                  <p className="text-sm text-muted-foreground">Total investido no período selecionado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5" />
                    Leads no período
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalLeadsCount}</div>
                  <p className="text-sm text-muted-foreground">Quantidade de leads recebidos no período</p>
                </CardContent>
              </Card>
            </div>

            {/* Resumo da Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Resumo da Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{totalLeadsCount}</div>
                    <div className="text-sm text-muted-foreground">Total de Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{convertedLeadsCount}</div>
                    <div className="text-sm text-muted-foreground">Leads Convertidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{(conversionRate || 0).toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Taxa de Conversão</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'max-integration':
        return <MaxIntegrationDashboard />

      case 'solicitacoes-site':
        return <SiteRequestsDashboard />

      case 'sac':
        return <SacDashboard />

      case 'sac-relatorio':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyRelatorioSacGestores />
          </Suspense>
        )

      case 'documentacao':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyDocumentationViewer />
          </Suspense>
        )

      case 'sugestoes':
        return (
          <div className="w-full">
            <AdminSugestoes />
          </div>
        )
      
      case 'openai-custos':
        return <OpenAICustosDashboard />
      
      case 'gerador-criativos':
        return <GeradorCriativosDashboardNew />
      
      case 'acervo-ideias':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Acervo de Ideias</h1>
                  <p className="text-muted-foreground">
                    Análise inteligente de briefings convertidos em oportunidades de negócio
                  </p>
                </div>
              </div>
              <LazyAcervoIdeasDashboard />
            </div>
          </Suspense>
        )

      case 'leads-parceria':
        return <LeadsParcerriaPanel />
      
      case 'clientes':
      default:
        return (
          <div className="space-y-4 w-full">
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
            <div className="w-full">
              <ClientesTable selectedManager={selectedManager} />
            </div>
          </div>
        )
    }
  }

  return (
    <ErrorBoundary>
      <div className="w-full">
        {renderContent()}
      </div>
    </ErrorBoundary>
  )
}

// Add default export for lazy loading
export default AdminDashboard
