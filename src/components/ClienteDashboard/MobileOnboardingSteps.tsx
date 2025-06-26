
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  FileText, 
  Upload, 
  TrendingUp, 
  BarChart3,
  Sparkles,
  ChevronRight
} from 'lucide-react'

interface MobileOnboardingStepsProps {
  onTabChange: (tab: string) => void
}

export function MobileOnboardingSteps({ onTabChange }: MobileOnboardingStepsProps) {
  const { user } = useAuth()
  const { briefing, arquivos, vendas, loading } = useClienteData(user?.email || '')

  if (loading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-48 bg-gray-800 rounded-xl"></div>
      </div>
    )
  }

  const steps = [
    {
      id: 'briefing',
      title: 'Briefing',
      description: 'Conte sobre seu negócio',
      icon: FileText,
      completed: briefing && Object.keys(briefing).length > 0,
      action: () => onTabChange('briefing'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'arquivos',
      title: 'Materiais',
      description: 'Upload de logos e fotos',
      icon: Upload,
      completed: arquivos && arquivos.length > 0,
      action: () => onTabChange('arquivos'),
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'campanhas',
      title: 'Campanhas',
      description: 'Configurar estratégias',
      icon: BarChart3,
      completed: false,
      action: () => onTabChange('campanhas'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'vendas',
      title: 'Vendas',
      description: 'Registrar resultados',
      icon: TrendingUp,
      completed: vendas && vendas.length > 0,
      action: () => onTabChange('vendas'),
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100

  return (
    <div className="mobile-safe p-4 space-y-6">
      {/* Header fixo premium */}
      <div className="bg-gradient-to-r from-slate-800 to-gray-900 rounded-2xl p-4 shadow-xl border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Configuração</h2>
              <p className="text-gray-400 text-sm">Complete os passos essenciais</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30"
          >
            {completedSteps}/{steps.length}
          </Badge>
        </div>
        
        {/* Barra de progresso premium */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300 font-medium">Progresso</span>
            <span className="text-white font-semibold">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-slate-700/50 rounded-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Lista de etapas mobile premium */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`
              mobile-safe p-4 rounded-xl border transition-all duration-300 
              ${step.completed 
                ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/50' 
                : 'bg-slate-800/80 border-slate-700/50'
              }
              active:scale-98 shadow-lg
            `}
            onClick={step.action}
          >
            <div className="flex items-center gap-4">
              {/* Ícone premium */}
              <div className={`
                p-3 rounded-xl transition-all duration-300
                ${step.completed 
                  ? 'bg-green-600/20 border border-green-500/30' 
                  : 'bg-slate-700/50 border border-slate-600/30'
                }
              `}>
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <step.icon className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`
                    font-semibold mobile-text
                    ${step.completed ? 'text-green-300' : 'text-white'}
                  `}>
                    {step.title}
                  </h3>
                  {step.completed && (
                    <Badge 
                      variant="outline" 
                      className="bg-green-600/20 text-green-300 border-green-500/30 text-xs"
                    >
                      ✓
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  {step.description}
                </p>
                <Button
                  size="sm"
                  className={`
                    mobile-button text-sm
                    ${step.completed 
                      ? 'bg-green-600/20 text-green-300 border border-green-500/30' 
                      : `bg-gradient-to-r ${step.color} text-white`
                    }
                  `}
                >
                  {step.completed ? 'Ver' : 'Começar'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
