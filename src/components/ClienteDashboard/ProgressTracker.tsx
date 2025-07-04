
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Star, Target } from 'lucide-react'

interface ProgressTrackerProps {
  percentage: number
  completedSteps: number
  totalSteps: number
}

export function ProgressTracker({ percentage, completedSteps, totalSteps }: ProgressTrackerProps) {
  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getProgressMessage = () => {
    if (percentage >= 100) return '🎉 Parabéns! Você completou toda a jornada!'
    if (percentage >= 75) return '🚀 Quase lá! Sua campanha está quase pronta!'
    if (percentage >= 50) return '💪 Ótimo progresso! Continue assim!'
    if (percentage >= 25) return '📈 Você está no caminho certo!'
    return '🌟 Bem-vindo! Vamos começar sua jornada!'
  }

  const getIcon = () => {
    if (percentage >= 100) return <Trophy className="h-6 w-6 text-yellow-400" />
    if (percentage >= 50) return <Star className="h-6 w-6 text-blue-400" />
    return <Target className="h-6 w-6 text-orange-400" />
  }

  return (
    <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <h3 className="text-lg font-bold text-white">
                Seu Progresso na Jornada
              </h3>
              <p className="text-gray-400 text-sm">
                {completedSteps} de {totalSteps} etapas concluídas
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {percentage}%
            </div>
            <div className="text-xs text-gray-400">
              Completo
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Progress 
            value={percentage} 
            className="h-3 bg-gray-700"
          />
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>Início</span>
            <span>Meio</span>
            <span>Quase lá</span>
            <span>Completo!</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-center text-white font-medium">
            {getProgressMessage()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
