
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Upload, TrendingUp, Play, Headphones } from 'lucide-react'

interface ClienteQuickActionsProps {
  onTabChange: (tab: string) => void
}

export function ClienteQuickActions({ onTabChange }: ClienteQuickActionsProps) {
  const quickActions = [
    {
      title: 'Preencher Briefing',
      description: 'Complete as informações do seu projeto',
      icon: FileText,
      action: () => onTabChange('briefing'),
      color: 'bg-blue-500'
    },
    {
      title: 'Enviar Materiais',
      description: 'Faça upload de logos, fotos e outros materiais',
      icon: Upload,
      action: () => onTabChange('arquivos'),
      color: 'bg-green-500'
    },
    {
      title: 'Registrar Vendas',
      description: 'Acompanhe o desempenho das suas campanhas',
      icon: TrendingUp,
      action: () => onTabChange('vendas'),
      color: 'bg-purple-500'
    },
    {
      title: 'Assistir Tutoriais',
      description: 'Aprenda com nossos vídeos explicativos',
      icon: Play,
      action: () => onTabChange('tutoriais'),
      color: 'bg-orange-500'
    },
    {
      title: 'Suporte Rápido',
      description: 'Acesse nossa central de atendimento via SAC para tirar dúvidas e receber suporte',
      icon: Headphones,
      action: () => onTabChange('suporte'),
      color: 'bg-teal-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quickActions.map((action, index) => (
        <Card 
          key={index} 
          className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 cursor-pointer group"
          onClick={action.action}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className={`${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
