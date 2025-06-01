
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
      onClick: () => onTabChange('dashboard')
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      onClick: () => onTabChange('clientes')
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      onClick: () => onTabChange('chat')
    },
    {
      id: 'documentacao',
      label: 'Documentação',
      icon: Book,
      onClick: () => onTabChange('documentacao')
    }
  ]

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const isActive = activeTab === item.id
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            className={`
              ${isCollapsed ? 'w-8 p-2' : 'w-full justify-start'}
              ${isActive 
                ? 'sidebar-item active bg-tech-purple/20 text-tech-purple border-l-2 border-tech-purple' 
                : 'sidebar-item text-secondary-text hover:bg-neutral-surface hover:text-primary-text'
              }
              transition-all duration-200
            `}
            onClick={item.onClick}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className={`h-4 w-4 ${!isCollapsed ? 'mr-3' : ''}`} />
            {!isCollapsed && item.label}
          </Button>
        )
      })}

      <div className="pt-4 border-t border-neutral-border">
        <Button
          variant="ghost"
          className={`
            ${isCollapsed ? 'w-8 p-2' : 'w-full justify-start'}
            ${selectedManager === '__GESTORES__' 
              ? 'sidebar-item active bg-tech-purple/20 text-tech-purple border-l-2 border-tech-purple' 
              : 'sidebar-item text-secondary-text hover:bg-neutral-surface hover:text-primary-text'
            }
            transition-all duration-200
          `}
          onClick={() => onManagerSelect('__GESTORES__')}
          title={isCollapsed ? 'Gestores' : ''}
        >
          <Settings className={`h-4 w-4 ${!isCollapsed ? 'mr-3' : ''}`} />
          {!isCollapsed && 'Gestores'}
        </Button>
      </div>
    </nav>
  )
}
