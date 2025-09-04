
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/use-mobile'
import { 
  FileText, 
  Upload, 
  Headphones, 
  DollarSign,
  Globe,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Users,
  Key,
  Mail,
  AlertCircle
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
            <CardTitle className="text-lg">Libere sua Business Manager</CardTitle>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{completedSteps}/{steps.length} Concluído</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {Math.round(progress)}%
              </Badge>
            </div>
            <Progress value={progress} className="w-full h-2" />
          </CardHeader>
        </Card>

        {/* Aviso sobre opções de BM */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  💡 Importante: Para fazer anúncios no Facebook
                </h3>
                
                <div className="space-y-3 text-sm text-blue-700">
                  <p className="font-medium">
                    Você tem <strong>2 opções</strong> para começar seus anúncios:
                  </p>
                  
                  {/* Opção 1 */}
                  <div className="bg-white/50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xs">1</div>
                      <Key className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-800">MAIS RÁPIDO: Login e Senha</span>
                    </div>
                    <p className="ml-7 text-gray-700 text-xs">
                      Passe seu email e senha do Facebook para seu gestor no chat. É mais rápido!
                    </p>
                  </div>

                  {/* Opção 2 */}
                  <div className="bg-white/50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">2</div>
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-800">Business Manager (Tutorial)</span>
                    </div>
                    <p className="ml-7 text-gray-700 text-xs">
                      Se preferir, siga o tutorial abaixo para liberar permissões via Business Manager.
                    </p>
                  </div>

                  <p className="font-medium text-blue-800 text-xs">
                    ⚠️ <strong>Escolha apenas UMA opção!</strong> Ambas funcionam perfeitamente.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
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
              <li>• Para começar rápido: passe login/senha no chat</li>
              <li>• Ou siga o tutorial da Business Manager</li>
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
          <span>Libere sua Business Manager - Configure Sua Campanha</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {completedSteps}/{steps.length} Concluído
          </Badge>
        </CardTitle>
        <Progress value={progress} className="w-full h-3" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aviso sobre opções de BM */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                💡 Importante: Para fazer anúncios no Facebook você tem 2 opções
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Opção 1 */}
                <div className="bg-white/70 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <Key className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">MAIS RÁPIDO: Login e Senha</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Passe seu <strong>email e senha do Facebook</strong> para seu gestor responsável no chat. 
                    É o método mais rápido para começar!
                  </p>
                </div>

                {/* Opção 2 */}
                <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Business Manager (Tutorial)</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Se preferir não passar login/senha, siga o tutorial abaixo para liberar 
                    permissões via Business Manager do Facebook.
                  </p>
                </div>
              </div>

              <div className="bg-orange-100 rounded-lg p-3 border border-orange-200">
                <p className="font-medium text-orange-800 text-sm flex items-center gap-2">
                  ⚠️ <strong>Escolha apenas UMA das opções acima!</strong> Ambas funcionam perfeitamente. 
                  A opção 1 é mais rápida, a opção 2 oferece mais controle.
                </p>
              </div>
            </div>
          </div>
        </div>

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
            <li>• Para começar rapidamente: passe login/senha do Facebook no chat</li>
            <li>• Se preferir mais controle: siga o tutorial da Business Manager</li>
            <li>• Quanto mais materiais enviar, melhores serão seus anúncios</li>
            <li>• As métricas só aparecerão após sua campanha estar ativa</li>
            <li>• O site é opcional, mas recomendado para melhores conversões</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
