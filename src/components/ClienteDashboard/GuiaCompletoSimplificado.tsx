
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/useIsMobile'
import { 
  FileText, 
  Upload, 
  Headphones, 
  DollarSign,
  Globe,
  BarChart3,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

interface GuiaCompletoSimplificadoProps {
  onTabChange: (tab: string) => void
}

export function GuiaCompletoSimplificado({ onTabChange }: GuiaCompletoSimplificadoProps) {
  const { user } = useAuth()
  const { cliente, briefing, arquivos } = useClienteData(user?.email || '')
  const isMobile = useIsMobile()

  const steps = [
    {
      id: 'briefing',
      title: '1. Preencha o Formulário',
      description: 'Complete as informações sobre seu produto/serviço',
      icon: FileText,
      completed: !!briefing,
      required: true
    },
    {
      id: 'arquivos', 
      title: '2. Envie os Materiais',
      description: 'Faça upload de fotos e vídeos para criação dos anúncios',
      icon: Upload,
      completed: arquivos.length > 0,
      required: true
    },
    {
      id: 'suporte',
      title: '3. Contrate o Suporte (Se Necessário)',
      description: 'Suporte adicional especializado para seu negócio',
      icon: Headphones,
      completed: false,
      required: false
    },
    {
      id: 'comissao',
      title: '4. Defina o Valor da Comissão',
      description: 'Informe quanto está disposto a pagar mensalmente',
      icon: DollarSign,
      completed: cliente?.comissao_confirmada || false,
      required: true
    },
    {
      id: 'site',
      title: '5. Descreva Como Deseja o Site (Opcional)',
      description: 'Personalize seu site ou use o modelo padrão',
      icon: Globe,
      completed: !!cliente?.site_descricao_personalizada,
      required: false
    },
    {
      id: 'vendas',
      title: '6. Visualize as Métricas da Campanha',
      description: 'Acompanhe resultados após ativação da campanha',
      icon: BarChart3,
      completed: false,
      required: false
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const requiredSteps = steps.filter(step => step.required)
  const completedRequiredSteps = requiredSteps.filter(step => step.completed).length
  const progress = (completedSteps / steps.length) * 100

  if (isMobile) {
    return (
      <div className="p-4 space-y-4">
        {/* Header */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Configure Sua Campanha</CardTitle>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{completedSteps}/{steps.length} Concluído</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {Math.round(progress)}%
              </Badge>
            </div>
            <Progress value={progress} className="w-full h-2" />
          </CardHeader>
        </Card>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = step.completed
            const isDisabled = index > 0 && !steps[0].completed
            
            return (
              <Card 
                key={step.id}
                className={`
                  transition-all duration-200
                  ${isCompleted 
                    ? 'border-green-200 bg-green-50' 
                    : isDisabled 
                      ? 'border-gray-200 bg-gray-50 opacity-60' 
                      : 'border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                        ${isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isDisabled 
                            ? 'bg-gray-300 text-gray-500'
                            : 'bg-blue-100 text-blue-600'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {step.title}
                          </h4>
                          {step.required && (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200 flex-shrink-0">
                              Obrig.
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">{step.description}</p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => onTabChange(step.id)}
                      disabled={isDisabled}
                      variant={isCompleted ? "outline" : "default"}
                      size="sm"
                      className={`
                        ml-2 flex-shrink-0
                        ${isCompleted ? "text-green-600 border-green-300" : ""}
                      `}
                    >
                      {isCompleted ? (
                        'Ver'
                      ) : (
                        <>
                          {isDisabled ? 'Block.' : 'Ir'}
                          {!isDisabled && <ArrowRight className="w-3 h-3 ml-1" />}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tips */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-yellow-800 mb-2 text-sm">💡 Dicas:</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Complete o briefing primeiro</li>
              <li>• Envie bastante material visual</li>
              <li>• Defina um valor justo para a comissão</li>
              <li>• Métricas aparecem após ativação</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Versão desktop
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Guia Completo - Configure Sua Campanha</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {completedSteps}/{steps.length} Concluído
          </Badge>
        </CardTitle>
        <Progress value={progress} className="w-full h-3" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Status da Configuração</h3>
          <div className="text-sm text-gray-700">
            <p>✅ <strong>Obrigatórios:</strong> {completedRequiredSteps}/{requiredSteps.length} concluídos</p>
            <p>📊 <strong>Progresso geral:</strong> {Math.round(progress)}% completo</p>
            {completedRequiredSteps === requiredSteps.length && (
              <p className="text-green-600 font-medium mt-2">
                🎉 Todos os passos obrigatórios foram concluídos!
              </p>
            )}
          </div>
        </div>

        {/* Lista de Passos */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = step.completed
            const isDisabled = index > 0 && !steps[0].completed
            
            return (
              <div 
                key={step.id}
                className={`
                  border rounded-lg p-4 transition-all duration-200
                  ${isCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : isDisabled 
                      ? 'bg-gray-50 border-gray-200 opacity-60' 
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isDisabled 
                          ? 'bg-gray-300 text-gray-500'
                          : 'bg-blue-100 text-blue-600'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{step.title}</h4>
                        {step.required && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                            Obrigatório
                          </Badge>
                        )}
                        {!step.required && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                            Opcional
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onTabChange(step.id)}
                    disabled={isDisabled}
                    variant={isCompleted ? "outline" : "default"}
                    size="sm"
                    className={isCompleted ? "text-green-600 border-green-300" : ""}
                  >
                    {isCompleted ? (
                      'Revisar'
                    ) : (
                      <>
                        {isDisabled ? 'Bloqueado' : 'Iniciar'}
                        {!isDisabled && <ArrowRight className="w-4 h-4 ml-1" />}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dicas */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-yellow-800 mb-2">💡 Dicas Importantes:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Complete o formulário primeiro para liberar os outros passos</li>
            <li>• Quanto mais materiais enviar, melhores serão seus anúncios</li>
            <li>• Defina um valor justo para a comissão mensal</li>
            <li>• As métricas só aparecerão após sua campanha estar ativa</li>
            <li>• O site é opcional, mas recomendado para melhores conversões</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
