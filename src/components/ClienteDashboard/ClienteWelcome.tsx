
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  Play,
  Headphones,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Folder
} from 'lucide-react'
import { BriefingMaterialsModal } from '@/components/ClientesTable/BriefingMaterialsModal'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'

interface ClienteWelcomeProps {
  onTabChange: (tab: string) => void
}

export function ClienteWelcome({ onTabChange }: ClienteWelcomeProps) {
  const { user } = useAuth()
  const { briefing, arquivos, vendas, loading } = useClienteData(user?.email || '')

  console.log('🔍 [ClienteWelcome] Dados carregados:', {
    email: user?.email,
    temBriefing: !!briefing,
    arquivosCount: arquivos.length,
    vendasCount: vendas.length,
    loading
  })

  const getBriefingStatus = () => {
    if (loading) return { text: 'Carregando...', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    if (!briefing) return { text: 'Pendente', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    return { text: 'Preenchido', color: 'bg-green-100 text-green-800', icon: CheckCircle }
  }

  const briefingStatus = getBriefingStatus()

  const cards = [
    {
      title: 'Briefing do Produto',
      description: 'Preencha as informações sobre seu produto/serviço',
      icon: FileText,
      action: 'briefing',
      status: briefingStatus,
      showMaterials: !!briefing
    },
    {
      title: 'Materiais e Arquivos',
      description: 'Envie logos, imagens e outros materiais',
      icon: Upload,
      action: 'arquivos',
      status: {
        text: `${arquivos.length} arquivo(s)`,
        color: arquivos.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800',
        icon: Upload
      },
      showMaterials: arquivos.length > 0
    },
    {
      title: 'Vendas Realizadas',
      description: 'Acompanhe seus resultados de vendas',
      icon: TrendingUp,
      action: 'vendas',
      status: {
        text: `${vendas.length} venda(s)`,
        color: vendas.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
        icon: TrendingUp
      }
    },
    {
      title: 'Tutoriais',
      description: 'Aprenda com nossos vídeos explicativos',
      icon: Play,
      action: 'tutoriais',
      status: {
        text: 'Disponível',
        color: 'bg-purple-100 text-purple-800',
        icon: Play
      }
    },
    {
      title: 'Suporte Rápido',
      description: 'Tire suas dúvidas e receba ajuda',
      icon: Headphones,
      action: 'suporte',
      status: {
        text: 'Online',
        color: 'bg-green-100 text-green-800',
        icon: Headphones
      }
    }
  ]

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header de Boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Bem-vindo ao seu Painel! 🚀
        </h1>
        <p className="text-blue-100 text-sm md:text-base opacity-90">
          Gerencie suas campanhas, materiais e acompanhe seus resultados
        </p>
      </div>

      {/* Cards de Ações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const StatusIcon = card.status.icon
          
          return (
            <Card key={card.action} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {card.title}
                      </CardTitle>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${card.status.color} border-0 font-medium`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {card.status.text}
                  </Badge>
                  
                  {/* Botão para ver materiais quando disponível */}
                  {card.showMaterials && (
                    <BriefingMaterialsModal
                      emailCliente={user?.email || ''}
                      nomeCliente={user?.email?.split('@')[0] || 'Cliente'}
                      filterType={card.action === 'briefing' ? 'briefing' : 'creative'}
                      trigger={
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 px-2 text-xs border-gray-300 hover:bg-gray-50"
                        >
                          <Folder className="w-3 h-3 mr-1" />
                          Ver Materiais
                        </Button>
                      }
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4">
                  {card.description}
                </p>
                
                <Button 
                  onClick={() => onTabChange(card.action)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {card.action === 'briefing' && !briefing && 'Preencher Briefing'}
                  {card.action === 'briefing' && briefing && 'Ver/Editar Briefing'}
                  {card.action === 'arquivos' && 'Gerenciar Arquivos'}
                  {card.action === 'vendas' && 'Ver Vendas'}
                  {card.action === 'tutoriais' && 'Assistir Tutoriais'}
                  {card.action === 'suporte' && 'Obter Suporte'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Resumo Rápido */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Eye className="w-5 h-5 text-blue-600" />
            Resumo da Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {briefing ? '1' : '0'}
              </div>
              <div className="text-xs text-blue-600 font-medium">Briefing</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {arquivos.length}
              </div>
              <div className="text-xs text-purple-600 font-medium">Arquivos</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {vendas.length}
              </div>
              <div className="text-xs text-green-600 font-medium">Vendas</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">100%</div>
              <div className="text-xs text-orange-600 font-medium">Suporte</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
