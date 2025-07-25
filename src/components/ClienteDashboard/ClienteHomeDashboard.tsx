
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { useClienteProgresso } from '@/hooks/useClienteProgresso'
import { ProgressTracker } from './ProgressTracker'
import { StepCard } from './StepCard'
import { GameElements } from './GameElements'
import { ImportantReminders } from './ImportantReminders'
import { Card, CardContent } from '@/components/ui/card'

interface ClienteHomeDashboardProps {
  onTabChange: (tab: string) => void
}

export function ClienteHomeDashboard({ onTabChange }: ClienteHomeDashboardProps) {
  const { user } = useAuth()
  const { cliente, briefing, arquivos, loading, refreshData } = useClienteData(user?.email || '')
  const { progresso, loading: progressoLoading, refetch: refetchProgresso } = useClienteProgresso(user?.email || '')

  console.log('🏠 [ClienteHomeDashboard] Estado atual:', {
    clienteEmail: user?.email,
    progressoSteps: Array.from(progresso),
    briefingCompleto: briefing?.formulario_completo,
    arquivosCount: arquivos?.length || 0,
    comissaoConfirmada: cliente?.comissao_confirmada,
    statusCampanha: cliente?.status_campanha
  })

  // Função para recarregar tudo
  const handleRefreshAll = async () => {
    console.log('🔄 [ClienteHomeDashboard] Recarregando dados completos...')
    await Promise.all([
      refreshData(),
      refetchProgresso()
    ])
  }

  // Calcular progresso das 6 etapas
  const calculateProgress = () => {
    let completedSteps = 0
    const steps = []

    // Etapa 1: Formulário Preenchido (16.7%)
    const formularioCompleto = briefing?.formulario_completo || false
    steps.push({
      id: 1,
      title: 'Formulário Preenchido',
      description: 'Briefing completo enviado com todas as informações necessárias',
      icon: '📝',
      completed: formularioCompleto,
      action: () => onTabChange('briefing'),
      actionText: formularioCompleto ? 'Ver Briefing' : 'Preencher Agora'
    })
    if (formularioCompleto) completedSteps++

    // Etapa 2: Materiais Enviados (33.3%)
    const materiaisEnviados = arquivos && arquivos.length > 0
    steps.push({
      id: 2,
      title: 'Materiais Enviados',
      description: 'Upload de logos, fotos e materiais para criação da campanha',
      icon: '📁',
      completed: materiaisEnviados,
      action: () => onTabChange('arquivos'),
      actionText: materiaisEnviados ? 'Ver Materiais' : 'Enviar Materiais'
    })
    if (materiaisEnviados) completedSteps++

    // Etapa 3: Configuração BM (50%) - AGORA CONECTADO AO PROGRESSO
    const bmConfigurado = progresso.has(3) || cliente?.numero_bm
    steps.push({
      id: 3,
      title: 'BM Configurado',
      description: 'Conversou com gestor para configurar o Business Manager',
      icon: '💬',
      completed: bmConfigurado,
      action: () => onTabChange('suporte'),
      actionText: bmConfigurado ? 'Configurado' : 'Falar com Gestor'
    })
    if (bmConfigurado) completedSteps++

    // Etapa 4: Comissão Definida (66.7%) - AGORA CONECTADO AO PROGRESSO
    const comissaoDefinida = cliente?.comissao_confirmada || progresso.has(4)
    steps.push({
      id: 4,
      title: 'Comissão Confirmada',
      description: 'Valor da comissão definido e confirmado no sistema',
      icon: '💰',
      completed: comissaoDefinida,
      action: () => onTabChange('comissao'),
      actionText: comissaoDefinida ? 'Ver Comissão' : 'Definir Comissão'
    })
    if (comissaoDefinida) completedSteps++

    // Etapa 5: Campanha Ativa (83.3%)
    const campanhaAtiva = cliente?.status_campanha?.includes('Otimização') || 
                         cliente?.status_campanha?.includes('Saque Pendente') ||
                         cliente?.link_campanha ||
                         progresso.has(5)
    steps.push({
      id: 5,
      title: 'Campanha no Ar',
      description: 'Sua campanha está ativa e rodando no Meta Ads',
      icon: '🚀',
      completed: campanhaAtiva,
      action: () => {},
      actionText: campanhaAtiva ? 'Campanha Ativa' : 'Aguardando...'
    })
    if (campanhaAtiva) completedSteps++

    // Etapa 6: Métricas Disponíveis (100%) - AGORA CONECTADO AO PROGRESSO
    const metricasDisponiveis = progresso.has(6) && campanhaAtiva
    steps.push({
      id: 6,
      title: 'Métricas Disponíveis',
      description: 'Visualize os resultados e métricas da sua campanha',
      icon: '📊',
      completed: metricasDisponiveis,
      action: () => onTabChange('vendas'),
      actionText: metricasDisponiveis ? 'Ver Métricas' : 'Em Breve...'
    })
    if (metricasDisponiveis) completedSteps++

    console.log('📊 [ClienteHomeDashboard] Progresso calculado:', {
      completedSteps,
      totalSteps: 6,
      percentage: Math.round((completedSteps / 6) * 100),
      steps: steps.map(s => ({ id: s.id, completed: s.completed }))
    })

    return {
      steps,
      completedSteps,
      totalSteps: 6,
      percentage: Math.round((completedSteps / 6) * 100)
    }
  }

  if (loading || progressoLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const progress = calculateProgress()

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Barra de Progresso Principal */}
      <ProgressTracker
        percentage={progress.percentage}
        completedSteps={progress.completedSteps}
        totalSteps={progress.totalSteps}
      />

      {/* Elementos de Gamificação */}
      <GameElements
        completedSteps={progress.completedSteps}
        percentage={progress.percentage}
      />

      {/* Cards das Etapas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {progress.steps.map((step) => (
          <StepCard
            key={step.id}
            step={step}
          />
        ))}
      </div>

      {/* Lembretes Importantes */}
      <ImportantReminders />

      {/* Seção de Status do Cliente */}
      {cliente && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-muted-foreground text-sm">Status da Campanha</p>
                <p className="text-foreground font-semibold">
                  {cliente.status_campanha || 'Cliente Novo'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Valor da Comissão</p>
                <p className="text-green-400 font-semibold">
                  R$ {cliente.valor_comissao || 60}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Gestor Responsável</p>
                <p className="text-foreground font-semibold">
                  {cliente.email_gestor?.split('@')[0] || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
