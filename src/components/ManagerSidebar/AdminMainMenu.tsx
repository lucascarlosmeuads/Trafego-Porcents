
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Users, 
  Settings, 
  Book,
  MessageCircle
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
      description: 'Visão geral e métricas',
      onClick: () => onTabChange('dashboard')
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      description: 'Gerenciar clientes',
      onClick: () => onTabChange('clientes')
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      description: 'Conversas com clientes',
      onClick: () => onTabChange('chat')
    },
    {
      id: 'documentacao',
      label: 'Documentação',
      icon: Book,
      description: 'Guias e manuais',
      onClick: () => onTabChange('documentacao')
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
              ${isCollapsed ? 'w-10 p-2 justify-center' : 'w-full justify-start'}
              ${isActive 
                ? 'bg-admin-purple/20 text-admin-purple border-l-2 border-admin-purple shadow-sm' 
                : 'text-admin-text-secondary hover:bg-admin-border/20 hover:text-admin-text-primary'
              }
              transition-all duration-200 rounded-lg h-auto ${!isCollapsed ? 'py-3' : 'py-2'}
            `}
            onClick={item.onClick}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className={`h-4 w-4 ${!isCollapsed ? 'mr-3' : ''}`} />
            {!isCollapsed && (
              <div className="flex flex-col items-start text-left">
                <span className="font-medium text-sm">{item.label}</span>
                <span className="text-xs text-admin-text-secondary opacity-70">{item.description}</span>
              </div>
            )}
          </Button>
        )
      })}

      <div className="pt-4">
        <div className="h-px bg-admin-border mb-4"></div>
        <Button
          variant="ghost"
          className={`
            ${isCollapsed ? 'w-10 p-2 justify-center' : 'w-full justify-start'}
            ${selectedManager === '__GESTORES__' 
              ? 'bg-admin-purple/20 text-admin-purple border-l-2 border-admin-purple shadow-sm' 
              : 'text-admin-text-secondary hover:bg-admin-border/20 hover:text-admin-text-primary'
            }
            transition-all duration-200 rounded-lg h-auto ${!isCollapsed ? 'py-3' : 'py-2'}
          `}
          onClick={() => onManagerSelect('__GESTORES__')}
          title={isCollapsed ? 'Gestores' : ''}
        >
          <Settings className={`h-4 w-4 ${!isCollapsed ? 'mr-3' : ''}`} />
          {!isCollapsed && (
            <div className="flex flex-col items-start text-left">
              <span className="font-medium text-sm">Gestores</span>
              <span className="text-xs text-admin-text-secondary opacity-70">Gerenciar equipe</span>
            </div>
          )}
        </Button>
      </div>
    </nav>
  )
}
