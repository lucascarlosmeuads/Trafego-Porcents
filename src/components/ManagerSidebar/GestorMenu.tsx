
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  MessageCircle,
  AlertTriangle
} from 'lucide-react'

interface GestorMenuProps {
  activeTab: string
  onTabChange: (tab: string) => void
  problemasPendentes: number
  isCollapsed?: boolean
}

export function GestorMenu({ 
  activeTab, 
  onTabChange, 
  problemasPendentes,
  isCollapsed = false 
}: GestorMenuProps) {

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

      {problemasPendentes > 0 && (
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className={`
              ${isCollapsed ? 'w-8 p-2' : 'w-full justify-start'} 
              text-orange-600 hover:text-orange-700 hover:bg-orange-50
            `}
            onClick={() => onTabChange('clientes')}
            title={isCollapsed ? `${problemasPendentes} problemas pendentes` : ''}
          >
            <AlertTriangle className={`h-4 w-4 ${!isCollapsed ? 'mr-2' : ''}`} />
            {!isCollapsed && (
              <>
                Problemas
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                  {problemasPendentes}
                </Badge>
              </>
            )}
          </Button>
        </div>
      )}
    </nav>
  )
}
