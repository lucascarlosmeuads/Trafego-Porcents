
import { BarChart3, Users, Activity, Globe, MessageSquare, Lightbulb, Wand2 } from 'lucide-react'

interface GestorMenuProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isCollapsed?: boolean
}

export function GestorMenu({ activeTab, onTabChange, isCollapsed = false }: GestorMenuProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral e métricas',
      color: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20'
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      description: 'Gerenciar clientes',
      color: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20'
    },
    {
      id: 'gerador-criativos',
      label: 'Gerador de Criativos',
      icon: Wand2,
      description: 'Criar anúncios com IA',
      color: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20'
    },
    {
      id: 'solicitacoes-site',
      label: 'Sites',
      icon: Globe,
      description: 'Solicitações de site',
      color: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20'
    },
    {
      id: 'sac',
      label: 'SAC',
      icon: MessageSquare,
      description: 'Suporte ao cliente',
      color: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20'
    },
    {
      id: 'sugestoes',
      label: 'Sugestões',
      icon: Lightbulb,
      description: 'Melhorias do sistema',
      color: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20'
    }
  ]

  if (isCollapsed) {
    return (
      <div className="flex flex-col space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`
              w-10 h-10 rounded-lg border transition-all duration-200 group flex items-center justify-center
              ${activeTab === item.id 
                ? 'bg-gray-700/60 border-gray-600 shadow-lg' 
                : `${item.color} hover:transform hover:scale-105 hover:shadow-md`
              }
            `}
            onClick={() => onTabChange(item.id)}
            title={item.label}
          >
            <item.icon className={`h-4 w-4 ${
              activeTab === item.id 
                ? 'text-white' 
                : 'text-gray-400 group-hover:text-white'
            }`} />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {menuItems.map(item => (
        <button
          key={item.id}
          className={`
            p-4 rounded-lg border transition-all duration-200 text-left group
            ${activeTab === item.id 
              ? 'bg-gray-700/60 border-gray-600 shadow-lg transform scale-[1.02]' 
              : `${item.color} hover:transform hover:scale-[1.02] hover:shadow-md`
            }
          `}
          onClick={() => onTabChange(item.id)}
        >
          <div className="flex items-start space-x-3">
            <div className={`
              p-2 rounded-md transition-colors
              ${activeTab === item.id 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-800/40 text-gray-400 group-hover:text-white group-hover:bg-gray-700'
              }
            `}>
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`
                font-semibold text-sm transition-colors
                ${activeTab === item.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}
              `}>
                {item.label}
              </h3>
              <p className={`
                text-xs mt-1 transition-colors
                ${activeTab === item.id ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-400'}
              `}>
                {item.description}
              </p>
            </div>
          </div>
          
          {/* Indicador de ativo */}
          {activeTab === item.id && (
            <div className="mt-2 w-full h-0.5 bg-gradient-to-r from-purple-500 to-orange-400 rounded-full"></div>
          )}
        </button>
      ))}
    </div>
  )
}
