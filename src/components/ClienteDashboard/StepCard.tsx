
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, ArrowRight } from 'lucide-react'

interface Step {
  id: number
  title: string
  description: string
  icon: string
  completed: boolean
  action: () => void
  actionText: string
}

interface StepCardProps {
  step: Step
}

export function StepCard({ step }: StepCardProps) {
  const { id, title, description, icon, completed, action, actionText } = step

  return (
    <Card className={`transition-all duration-300 hover:scale-105 cursor-pointer ${
      completed 
        ? 'bg-gradient-to-br from-green-900 to-green-800 border-green-600' 
        : 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-gray-600'
    }`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{icon}</div>
              <div>
                <Badge variant={completed ? 'default' : 'secondary'} className="text-xs">
                  Etapa {id}
                </Badge>
              </div>
            </div>
            <div className="flex items-center">
              {completed ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <Clock className="h-6 w-6 text-gray-400" />
              )}
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <h3 className="font-bold text-white text-lg mb-2">
              {title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Status e Ação */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge 
                variant={completed ? 'default' : 'outline'}
                className={completed ? 'bg-green-600 text-white' : 'text-gray-400'}
              >
                {completed ? '✅ Concluído' : '⏳ Pendente'}
              </Badge>
            </div>

            {action && (
              <Button
                onClick={action}
                variant={completed ? 'secondary' : 'default'}
                className="w-full group"
                size="sm"
              >
                {actionText}
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
