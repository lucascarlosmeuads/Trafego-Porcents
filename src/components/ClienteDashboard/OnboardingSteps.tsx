
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  Circle, 
  FileText, 
  Upload, 
  TrendingUp, 
  BarChart3,
  Headphones,
  PlayCircle,
  Sparkles
} from 'lucide-react'

interface OnboardingStepsProps {
  onTabChange: (tab: string) => void
}

export function OnboardingSteps({ onTabChange }: OnboardingStepsProps) {
  const { user } = useAuth()
  const { briefing, arquivos, vendas, loading } = useClienteData(user?.email || '')

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-slate-800 rounded-2xl"></div>
      </div>
    )
  }

  const steps = [
    {
      id: 'briefing',
      title: 'Preencher Briefing',
      description: 'Conte-nos sobre seu negócio e objetivos',
      icon: FileText,
      completed: briefing && Object.keys(briefing).length > 0,
      action: () => onTabChange('briefing'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'arquivos',
      title: 'Enviar Materiais',
      description: 'Upload de logos, fotos e criativos',
      icon: Upload,
      completed: arquivos && arquivos.length > 0,
      action: () => onTabChange('arquivos'),
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'campanhas',
      title: 'Configurar Campanhas',
      description: 'Definir estratégias e públicos-alvo',
      icon: BarChart3,
      completed: false, // TODO: implementar lógica
      action: () => onTabChange('campanhas'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'vendas',
      title: 'Registrar Vendas',
      description: 'Acompanhar resultados e conversões',
      icon: TrendingUp,
      completed: vendas && vendas.length > 0,
      action: () => onTabChange('vendas'),
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100

  return (
    <Card className="bg-gradient-to-br from-slate-800/95 to-gray-900/95 border-slate-700/50 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Guia de Configuração</CardTitle>
              <CardDescription className="text-gray-300">
                Complete os passos para otimizar sua conta
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30 px-3 py-1"
          >
            {completedSteps}/{steps.length} Concluído
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Barra de progresso premium */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300 font-medium">Progresso Geral</span>
            <span className="text-white font-semibold">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-slate-700/50 rounded-full overflow-hidden"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full pointer-events-none"></div>
          </div>
        </div>

        {/* Lista de etapas premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative group">
              {/* Separador visual entre etapas */}
              {index > 0 && index % 2 === 0 && (
                <div className="absolute -top-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
              )}
              
              <div 
                className={`
                  p-4 rounded-xl border transition-all duration-300 cursor-pointer
                  ${step.completed 
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-700/50 shadow-lg' 
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/80'
                  }
                  hover:scale-105 hover:shadow-xl
                `}
                onClick={step.action}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone da etapa */}
                  <div className={`
                    p-2 rounded-lg transition-all duration-300
                    ${step.completed 
                      ? 'bg-green-600/20 border border-green-500/30' 
                      : 'bg-slate-700/50 border border-slate-600/30 group-hover:bg-slate-600/50'
                    }
                  `}>
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <step.icon className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
                    )}
                  </div>
                  
                  {/* Conteúdo da etapa */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`
                        font-semibold transition-colors
                        ${step.completed ? 'text-green-300' : 'text-white group-hover:text-blue-300'}
                      `}>
                        {step.title}
                      </h3>
                      {step.completed && (
                        <Badge 
                          variant="outline" 
                          className="bg-green-600/20 text-green-300 border-green-500/30 text-xs px-2 py-0.5"
                        >
                          ✓ Feito
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      {step.description}
                    </p>
                    <Button
                      size="sm"
                      variant={step.completed ? "outline" : "default"}
                      className={`
                        text-xs transition-all duration-300
                        ${step.completed 
                          ? 'border-green-600/50 text-green-300 hover:bg-green-600/20' 
                          : `bg-gradient-to-r ${step.color} hover:scale-105 shadow-md`
                        }
                      `}
                    >
                      {step.completed ? 'Ver Etapa' : 'Começar'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botões de ações secundárias */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700/50">
          <Button
            variant="outline"
            onClick={() => onTabChange('suporte')}
            className="flex-1 border-slate-600 bg-slate-800/50 text-gray-300 hover:text-white hover:bg-slate-700/80 transition-all duration-300"
          >
            <Headphones className="h-4 w-4 mr-2" />
            Acessar Suporte
          </Button>
          <Button
            variant="outline"
            onClick={() => onTabChange('tutoriais')}
            className="flex-1 border-slate-600 bg-slate-800/50 text-gray-300 hover:text-white hover:bg-slate-700/80 transition-all duration-300"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Ver Tutoriais
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
