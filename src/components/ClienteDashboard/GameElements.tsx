
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Award, Target, Zap, Crown } from 'lucide-react'

interface GameElementsProps {
  completedSteps: number
  percentage: number
}

export function GameElements({ completedSteps, percentage }: GameElementsProps) {
  const getBadges = () => {
    const badges = []
    
    if (completedSteps >= 1) {
      badges.push({
        icon: <Star className="h-4 w-4" />,
        title: '🌟 Iniciante',
        description: 'Primeiros passos dados!'
      })
    }
    
    if (completedSteps >= 2) {
      badges.push({
        icon: <Target className="h-4 w-4" />,
        title: '🎯 Colaborativo',
        description: 'Enviou seus materiais!'
      })
    }
    
    if (completedSteps >= 3) {
      badges.push({
        icon: <Zap className="h-4 w-4" />,
        title: '⚡ Comunicativo',
        description: 'Conversou com o gestor!'
      })
    }
    
    if (completedSteps >= 4) {
      badges.push({
        icon: <Award className="h-4 w-4" />,
        title: '💎 Comprometido',
        description: 'Definiu sua comissão!'
      })
    }
    
    if (completedSteps >= 5) {
      badges.push({
        icon: <Trophy className="h-4 w-4" />,
        title: '🚀 Ativo',
        description: 'Campanha no ar!'
      })
    }
    
    if (completedSteps >= 6) {
      badges.push({
        icon: <Crown className="h-4 w-4" />,
        title: '👑 Mestre',
        description: 'Jornada completa!'
      })
    }
    
    return badges
  }

  const getMotivationalMessage = () => {
    if (percentage >= 100) {
      return {
        title: '🏆 Parabéns, Campeão!',
        message: 'Você completou toda a jornada! Agora é hora de colher os frutos do seu trabalho.',
        color: 'text-yellow-400'
      }
    }
    
    if (percentage >= 75) {
      return {
        title: '🔥 Você está arrasando!',
        message: 'Falta pouco para completar toda a jornada. Continue firme!',
        color: 'text-blue-400'
      }
    }
    
    if (percentage >= 50) {
      return {
        title: '💪 Metade da jornada!',
        message: 'Você já percorreu metade do caminho. Que orgulho!',
        color: 'text-green-400'
      }
    }
    
    if (percentage >= 25) {
      return {
        title: '🌱 Crescendo bem!',
        message: 'Cada passo conta. Você está no caminho certo!',
        color: 'text-orange-400'
      }
    }
    
    return {
      title: '🚀 Vamos começar!',
      message: 'Sua jornada de sucesso começa agora. Cada etapa é importante!',
      color: 'text-purple-400'
    }
  }

  const badges = getBadges()
  const motivation = getMotivationalMessage()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Conquistas/Badges */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <h3 className="font-bold text-white">Suas Conquistas</h3>
          </div>
          
          <div className="space-y-2">
            {badges.length > 0 ? (
              badges.map((badge, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg">
                  <div className="text-yellow-400">
                    {badge.icon}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{badge.title}</p>
                    <p className="text-gray-400 text-xs">{badge.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  Complete suas primeiras etapas para desbloquear conquistas!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mensagem Motivacional */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className={`font-bold text-lg ${motivation.color}`}>
              {motivation.title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {motivation.message}
            </p>
            
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400">
                💡 <strong>Dica:</strong> Complete uma etapa por vez e mantenha-se em contato com seu gestor!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
