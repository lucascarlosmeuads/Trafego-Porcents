
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
            onClick={() => onTabChange(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <Icon className={`h-4 w-4 ${!isCollapsed ? 'mr-3' : ''}`} />
            {!isCollapsed && (
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-info-text">{item.description}</span>
              </div>
            )}
          </Button>
        )
      })}
    </nav>
  )
}
