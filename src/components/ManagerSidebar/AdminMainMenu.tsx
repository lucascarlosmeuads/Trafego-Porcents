
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
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? 'default' : 'ghost'}
          className={`
            ${isCollapsed ? 'w-8 p-2' : 'w-full justify-start'}
          `}
          onClick={item.onClick}
          title={isCollapsed ? item.label : ''}
        >
          <item.icon className={`h-4 w-4 ${!isCollapsed ? 'mr-2' : ''}`} />
          {!isCollapsed && item.label}
        </Button>
      ))}

      <div className="pt-4 border-t">
        <Button
          variant={selectedManager === '__GESTORES__' ? 'default' : 'ghost'}
          className={`
            ${isCollapsed ? 'w-8 p-2' : 'w-full justify-start'}
          `}
          onClick={() => onManagerSelect('__GESTORES__')}
          title={isCollapsed ? 'Gestores' : ''}
        >
          <Settings className={`h-4 w-4 ${!isCollapsed ? 'mr-2' : ''}`} />
          {!isCollapsed && 'Gestores'}
        </Button>
      </div>
    </nav>
  )
}
