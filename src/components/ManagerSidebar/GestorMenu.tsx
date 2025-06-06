
import { BarChart3, Users, Headphones, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GestorMenuProps {
  activeTab: string
  onTabChange: (tab: string) => void
  problemasPendentes?: number
  isCollapsed?: boolean
}

export function GestorMenu({ activeTab, onTabChange, problemasPendentes = 0, isCollapsed = false }: GestorMenuProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral e métricas',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      description: 'Gerenciar clientes',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'sac',
      label: 'SAC',
      icon: Headphones,
      description: 'Suporte aos clientes',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'sugestoes',
      label: 'Sugestões',
      icon: Lightbulb,
      description: 'Ideias de melhorias',
      color: 'from-yellow-500 to-yellow-600'
    }
  ]

  return (
    <nav className="space-y-3">
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            className={`
              ${isCollapsed ? 'w-10 p-2' : 'w-full justify-start'}
              ${isActive 
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-md' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent hover:border-gray-700/50'
              }
              transition-all duration-200 h-auto py-3 group
            `}
            onClick={() => onTabChange(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <div className={`
              ${isCollapsed ? 'w-6 h-6' : 'w-8 h-8 mr-3'} 
              rounded-lg flex items-center justify-center
              ${isActive 
                ? `bg-gradient-to-r ${item.color} shadow-md` 
                : 'bg-gray-800/60 group-hover:bg-gray-700/80'
              }
              transition-all duration-200
            `}>
              <Icon className={`${isCollapsed ? 'h-3 w-3' : 'h-4 w-4'} text-white`} />
            </div>
            
            {!isCollapsed && (
              <div className="flex flex-col items-start text-left">
                <span className="font-medium text-sm leading-tight">{item.label}</span>
                <span className="text-xs text-gray-400 leading-tight mt-0.5">{item.description}</span>
              </div>
            )}
          </Button>
        )
      })}
    </nav>
  )
}
