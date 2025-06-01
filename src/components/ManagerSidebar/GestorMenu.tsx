
import { BarChart3, Users, MessageCircle } from 'lucide-react'
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
      description: 'Visão geral e métricas'
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      description: 'Gerenciar clientes'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      description: 'Conversas com clientes'
    }
  ]

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'default' : 'ghost'}
            className={`
              ${isCollapsed ? 'w-8 p-2' : 'w-full justify-start'}
            `}
            onClick={() => onTabChange(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <Icon className={`h-4 w-4 ${!isCollapsed ? 'mr-2' : ''}`} />
            {!isCollapsed && (
              <div className="flex flex-col items-start">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </div>
            )}
          </Button>
        )
      })}
    </nav>
  )
}
