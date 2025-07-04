
import React from 'react'
import { cn } from '@/lib/utils'
import { ClienteProfileSection } from './ClienteProfileSection'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  FileText, 
  Upload, 
  Headphones, 
  DollarSign,
  Globe,
  BarChart3,
  CheckSquare,
  MessageCircle,
  CheckCircle
} from 'lucide-react'

interface ClienteSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  clienteInfo: any
}

export function ClienteSidebar({ activeTab, onTabChange, clienteInfo }: ClienteSidebarProps) {
  const menuItems = [
    {
      id: 'overview',
      label: 'Painel Principal',
      icon: Home,
      badge: null
    },
    {
      id: 'briefing',
      label: '1. Formulário',
      icon: FileText,
      badge: null,
      step: 1
    },
    {
      id: 'arquivos',
      label: '2. Materiais',
      icon: Upload,
      badge: null,
      step: 2
    },
    {
      id: 'suporte',
      label: '3. Suporte',
      icon: Headphones,
      badge: null,
      step: 3
    },
    {
      id: 'comissao',
      label: '4. Comissão',
      icon: DollarSign,
      badge: clienteInfo?.comissao_confirmada ? 'confirmed' : null,
      step: 4
    },
    {
      id: 'site',
      label: '5. Site (Opcional)',
      icon: Globe,
      badge: clienteInfo?.site_descricao_personalizada ? 'described' : 'optional',
      step: 5
    },
    {
      id: 'vendas',
      label: '6. Métricas',
      icon: BarChart3,
      badge: null,
      step: 6
    },
    {
      id: 'steps',
      label: 'Guia Completo',
      icon: CheckSquare,
      badge: null
    },
    {
      id: 'chat',
      label: 'Chat Direto',
      icon: MessageCircle,
      badge: null
    }
  ]

  const getBadgeContent = (badge: string | null) => {
    switch (badge) {
      case 'confirmed':
        return <CheckCircle className="w-3 h-3 text-green-600" />
      case 'described':
        return <CheckCircle className="w-3 h-3 text-purple-600" />
      case 'optional':
        return <span className="text-xs text-purple-600">Opc</span>
      default:
        return null
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <ClienteProfileSection clienteInfo={clienteInfo} />
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left h-auto py-3 px-3",
                isActive && "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive ? "text-blue-600" : "text-gray-500"
                  )} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <div className="flex-shrink-0">
                    {getBadgeContent(item.badge)}
                  </div>
                )}
              </div>
            </Button>
          )
        })}
      </nav>

      {/* Status da Campanha */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-800 mb-1">
            Status da Campanha:
          </div>
          <div className="text-sm font-semibold text-blue-700">
            {clienteInfo?.status_campanha || 'Em Configuração'}
          </div>
          {!clienteInfo?.status_campanha?.includes('Ativa') && (
            <div className="text-xs text-gray-600 mt-1">
              Complete os passos para ativar
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
