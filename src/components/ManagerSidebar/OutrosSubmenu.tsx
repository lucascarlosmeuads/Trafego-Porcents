
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSiteSolicitations } from '@/hooks/useSiteSolicitations'
import { 
  MoreHorizontal, 
  ChevronDown, 
  ChevronRight,
  Lightbulb, 
  BookOpen, 
  Globe, 
  Zap,
  BarChart3,
  Headphones
} from 'lucide-react'

interface OutrosSubmenuProps {
  activeTab: string
  onTabSelect: (tab: string) => void
  isCollapsed?: boolean
}

export function OutrosSubmenu({ activeTab, onTabSelect, isCollapsed = false }: OutrosSubmenuProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { solicitations } = useSiteSolicitations()
  
  // Contar solicitações pendentes
  const pendingSiteRequests = solicitations.filter(s => s.status === 'pendente').length

  const subMenuItems = [
    {
      id: 'sugestoes',
      label: 'Sugestões',
      icon: Lightbulb,
      description: 'Feedback e melhorias'
    },
    {
      id: 'documentacao',
      label: 'Documentação',
      icon: BookOpen,
      description: 'Guias e manuais'
    },
    {
      id: 'solicitacoes-site',
      label: 'Solicitações de Site',
      icon: Globe,
      description: 'Gerenciar pedidos de criação de site',
      badge: pendingSiteRequests > 0 ? pendingSiteRequests : undefined
    },
    {
      id: 'max-integration',
      label: 'Integração App Max',
      icon: Zap,
      description: 'Configurar integração automática',
      isNew: true,
      disabled: true // Temporariamente desabilitado
    },
    {
      id: 'sac-relatorio',
      label: 'Relatório SAC',
      icon: BarChart3,
      description: 'Relatórios de atendimento'
    }
  ]

  // Verificar se algum submenu está ativo
  const hasActiveSubmenu = subMenuItems.some(item => activeTab === item.id)

  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        className={`
          w-10 p-2
          ${hasActiveSubmenu 
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-md' 
            : 'text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent hover:border-gray-700/50'
          }
          transition-all duration-200 h-auto py-3 group
        `}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Outros"
      >
        <div className={`
          w-6 h-6 rounded-lg flex items-center justify-center
          ${hasActiveSubmenu 
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-md' 
            : 'bg-gray-800/60 group-hover:bg-gray-700/80'
          }
          transition-all duration-200
        `}>
          <MoreHorizontal className="h-3 w-3 text-white" />
        </div>
      </Button>
    )
  }

  return (
    <div className="space-y-1">
      {/* Menu Principal "Outros" */}
      <Button
        variant="ghost"
        className={`
          w-full justify-start
          ${hasActiveSubmenu 
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-md' 
            : 'text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent hover:border-gray-700/50'
          }
          transition-all duration-200 h-auto py-3 group
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`
          w-8 h-8 mr-3 rounded-lg flex items-center justify-center
          ${hasActiveSubmenu 
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-md' 
            : 'bg-gray-800/60 group-hover:bg-gray-700/80'
          }
          transition-all duration-200
        `}>
          <MoreHorizontal className="h-4 w-4 text-white" />
        </div>
        
        <div className="flex flex-col items-start text-left flex-1">
          <div className="flex items-center justify-between w-full">
            <span className="font-medium text-sm leading-tight">Outros</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
          <span className="text-xs text-gray-400 leading-tight mt-0.5">Funcionalidades adicionais</span>
        </div>
      </Button>

      {/* Submenus */}
      {isExpanded && (
        <div className="ml-4 space-y-1 border-l border-gray-700/50 pl-4">
          {subMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                disabled={item.disabled}
                className={`
                  w-full justify-start text-left h-auto py-2 px-3 rounded-md
                  ${isActive 
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' 
                    : item.disabled
                      ? 'text-gray-500 cursor-not-allowed opacity-50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                  }
                  transition-all duration-200
                `}
                onClick={() => !item.disabled && onTabSelect(item.id)}
              >
                <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <div className="flex items-center justify-between w-full text-xs">
                  <div className="flex flex-col items-start">
                    <span className="font-medium leading-tight">{item.label}</span>
                    <span className="text-xs opacity-70 leading-tight">{item.description}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {item.isNew && (
                      <Badge 
                        variant="secondary" 
                        className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-1 py-0"
                      >
                        NOVO
                      </Badge>
                    )}
                    {item.disabled && (
                      <Badge 
                        variant="secondary" 
                        className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs px-1 py-0"
                      >
                        EM BREVE
                      </Badge>
                    )}
                    {item.badge && !item.disabled && (
                      <Badge 
                        variant="secondary" 
                        className="bg-red-500 text-white border-red-600 hover:bg-red-600 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
