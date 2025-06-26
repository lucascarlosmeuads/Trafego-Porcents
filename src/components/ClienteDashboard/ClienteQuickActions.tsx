
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  Play, 
  Headphones, 
  BarChart3,
  Sparkles,
  ArrowRight
} from 'lucide-react'

interface ClienteQuickActionsProps {
  onTabChange: (tab: string) => void
}

export function ClienteQuickActions({ onTabChange }: ClienteQuickActionsProps) {
  const quickActions = [
    {
      title: 'Preencher Briefing',
      description: 'Complete as informações do seu projeto para campanhas personalizadas',
      icon: FileText,
      action: () => onTabChange('briefing'),
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-900/20 to-blue-800/20',
      iconBg: 'bg-blue-600/20 border-blue-500/30',
      priority: 'high'
    },
    {
      title: 'Enviar Materiais',
      description: 'Faça upload de logos, fotos e outros materiais criativos',
      icon: Upload,
      action: () => onTabChange('arquivos'),
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-900/20 to-emerald-800/20',
      iconBg: 'bg-green-600/20 border-green-500/30',
      priority: 'high'
    },
    {
      title: 'Acompanhar Campanhas',
      description: 'Monitore métricas e performance das suas campanhas Meta Ads',
      icon: BarChart3,
      action: () => onTabChange('campanhas'),
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-900/20 to-purple-800/20',
      iconBg: 'bg-purple-600/20 border-purple-500/30',
      priority: 'medium'
    },
    {
      title: 'Registrar Vendas',
      description: 'Acompanhe o desempenho e ROI das suas campanhas',
      icon: TrendingUp,
      action: () => onTabChange('vendas'),
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-900/20 to-orange-800/20',
      iconBg: 'bg-orange-600/20 border-orange-500/30',
      priority: 'medium'
    },
    {
      title: 'Assistir Tutoriais',
      description: 'Aprenda com nossos vídeos explicativos e maximize seus resultados',
      icon: Play,
      action: () => onTabChange('tutoriais'),
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-900/20 to-indigo-800/20',
      iconBg: 'bg-indigo-600/20 border-indigo-500/30',
      priority: 'low'
    },
    {
      title: 'Suporte Especializado',
      description: 'Acesse nossa central de atendimento para tirar dúvidas e receber suporte',
      icon: Headphones,
      action: () => onTabChange('suporte'),
      gradient: 'from-teal-500 to-teal-600',
      bgGradient: 'from-teal-900/20 to-teal-800/20',
      iconBg: 'bg-teal-600/20 border-teal-500/30',
      priority: 'low'
    }
  ]

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge className="bg-red-600/20 text-red-300 border-red-500/30 text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Importante
          </Badge>
        )
      case 'medium':
        return (
          <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30 text-xs">
            Recomendado
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Ações Rápidas</h2>
        <p className="text-gray-400">Acesse rapidamente as principais funcionalidades</p>
      </div>

      {/* Grid de ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card 
            key={index} 
            className={`
              bg-gradient-to-br from-slate-800/90 to-gray-900/90 
              border-slate-700/50 backdrop-blur-sm shadow-xl rounded-2xl 
              hover:border-slate-600/50 transition-all duration-300 
              cursor-pointer group hover:scale-105 hover:shadow-2xl
              relative overflow-hidden
            `}
            onClick={action.action}
          >
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            <CardContent className="p-6 relative z-10">
              <div className="space-y-4">
                {/* Header com ícone e badge */}
                <div className="flex items-start justify-between">
                  <div className={`
                    p-3 rounded-xl transition-all duration-300 ${action.iconBg}
                    group-hover:scale-110 group-hover:shadow-lg
                  `}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  {getPriorityBadge(action.priority)}
                </div>
                
                {/* Conteúdo */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-lg group-hover:text-blue-300 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                    {action.description}
                  </p>
                </div>
                
                {/* Botão de ação */}
                <Button
                  className={`
                    w-full bg-gradient-to-r ${action.gradient} 
                    hover:scale-105 transition-all duration-300 
                    shadow-lg hover:shadow-xl border-0
                    group-hover:shadow-2xl
                  `}
                >
                  <span>Acessar</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
            
            {/* Efeito de brilho */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Card>
        ))}
      </div>
    </div>
  )
}
