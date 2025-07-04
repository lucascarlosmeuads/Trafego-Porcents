
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, Clock, Heart, MessageCircle, TrendingUp, Shield } from 'lucide-react'

export function ImportantReminders() {
  const reminders = [
    {
      icon: <Clock className="h-4 w-4" />,
      title: 'Processo de Teste',
      message: 'Estamos testando sua oferta juntos. Paciência é fundamental para o sucesso!',
      color: 'border-blue-500 bg-blue-50/10'
    },
    {
      icon: <Heart className="h-4 w-4" />,
      title: 'Parceria de Sucesso',
      message: 'Trabalhamos juntos pelo seu sucesso. Sua vitória é nossa vitória!',
      color: 'border-green-500 bg-green-50/10'
    },
    {
      icon: <MessageCircle className="h-4 w-4" />,
      title: 'Comunicação Clara',
      message: 'Mantenha-se em contato através do suporte. Estamos aqui para ajudar!',
      color: 'border-purple-500 bg-purple-50/10'
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      title: 'Transparência Total',
      message: 'Declare suas vendas regularmente para garantir o sucesso da parceria.',
      color: 'border-orange-500 bg-orange-50/10'
    },
    {
      icon: <Shield className="h-4 w-4" />,
      title: 'Sangue Frio',
      message: 'Testes podem ser desafiadores às vezes. Mantenha a calma e confie no processo!',
      color: 'border-red-500 bg-red-50/10'
    }
  ]

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-6">
          <Info className="h-5 w-5 text-blue-400" />
          <h3 className="font-bold text-white text-lg">Lembretes Importantes</h3>
        </div>

        <div className="space-y-4">
          {reminders.map((reminder, index) => (
            <Alert key={index} className={`${reminder.color} border-l-4`}>
              <div className="flex items-start gap-3">
                <div className="text-white mt-0.5">
                  {reminder.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm mb-1">
                    {reminder.title}
                  </h4>
                  <AlertDescription className="text-gray-300 text-sm">
                    {reminder.message}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-700/30">
          <div className="text-center space-y-2">
            <h4 className="font-bold text-white">
              🎯 Nossa Missão Conjunta
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Estamos aqui para transformar sua oferta em uma máquina de vendas. 
              Cada etapa dessa jornada foi pensada para maximizar seus resultados. 
              <strong className="text-blue-300"> Juntos, vamos longe!</strong>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
