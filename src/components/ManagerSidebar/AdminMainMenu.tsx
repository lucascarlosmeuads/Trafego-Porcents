
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Users, 
  Settings, 
  Book,
  MessageCircle,
  Lightbulb
} from 'lucide-react'

interface AdminMainMenuProps {
  activeTab: string
  selectedManager: string | null
  onTabChange: (tab: string) => void
  onManagerSelect: (manager: string | null) => void
  problemasPendentes: number
  isCollapsed?: boolean
}

export function AdminMainMenu({ 
  activeTab, 
  selectedManager, 
  onTabChange, 
  onManagerSelect,
  problemasPendentes,
  isCollapsed = false
}: AdminMainMenuProps) {

  // Menus ativos no painel Admin
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      onClick: () => onTabChange('dashboard'),
      color: 'from-blue-500 to-blue-600',
      description: 'Visão geral do sistema'
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      onClick: () => onTabChange('clientes'),
      color: 'from-green-500 to-green-600',
      description: 'Gerenciar todos os clientes'
    },
    {
      id: 'melhorias-dicas',
      label: 'Melhorias & Dicas',
      icon: Lightbulb,
      onClick: () => onTabChange('melhorias-dicas'),
      color: 'from-yellow-500 to-orange-500',
      description: 'Novidades e produtividade'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      onClick: () => onTabChange('chat'),
      color: 'from-purple-500 to-purple-600',
      description: 'Conversas e suporte'
    },
    {
      id: 'documentacao',
      label: 'Documentação',
      icon: Book,
      onClick: () => onTabChange('documentacao'),
      color: 'from-orange-500 to-orange-600',
      description: 'Guias e manuais'
    }
  ]

  return (
    <nav className="space-y-3">
      {menuItems.map((item) => {
        const isActive = activeTab === item.id
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            className={`
              ${isCollapsed ? 'w-10 p-2' : 'w-full justify-start'}
              ${isActive 
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-lg' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700'
              }
              transition-all duration-200 h-auto py-3
            `}
            onClick={item.onClick}
            title={isCollapsed ? item.label : ''}
          >
            <div className={`
              ${isCollapsed ? 'w-6 h-6' : 'w-8 h-8 mr-3'} 
              rounded-lg flex items-center justify-center
              ${isActive 
                ? `bg-gradient-to-r ${item.color} shadow-lg` 
                : 'bg-gray-800'
              }
              transition-all duration-200
            `}>
              <item.icon className={`${isCollapsed ? 'h-3 w-3' : 'h-4 w-4'} text-white`} />
            </div>
            
            {!isCollapsed && (
              <div className="flex flex-col items-start text-left">
                <span className="font-medium text-sm">{item.label}</span>
                <span className="text-xs text-gray-400">{item.description}</span>
              </div>
            )}
          </Button>
        )
      })}

      <div className="pt-4 border-t border-gray-800">
        <Button
          variant="ghost"
          className={`
            ${isCollapsed ? 'w-10 p-2' : 'w-full justify-start'}
            ${selectedManager === '__GESTORES__' 
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-lg' 
              : 'text-gray-300 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700'
            }
            transition-all duration-200 h-auto py-3
          `}
          onClick={() => onManagerSelect('__GESTORES__')}
          title={isCollapsed ? 'Gestores' : ''}
        >
          <div className={`
            ${isCollapsed ? 'w-6 h-6' : 'w-8 h-8 mr-3'} 
            rounded-lg flex items-center justify-center
            ${selectedManager === '__GESTORES__' 
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg' 
              : 'bg-gray-800'
            }
            transition-all duration-200
          `}>
            <Settings className={`${isCollapsed ? 'h-3 w-3' : 'h-4 w-4'} text-white`} />
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col items-start text-left">
              <span className="font-medium text-sm">Gestores</span>
              <span className="text-xs text-gray-400">Gerenciar equipe</span>
            </div>
          )}
        </Button>
      </div>
    </nav>
  )
}
