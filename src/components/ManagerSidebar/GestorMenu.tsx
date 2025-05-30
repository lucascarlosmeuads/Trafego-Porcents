
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  DollarSign,
  MessageCircle 
} from 'lucide-react'

interface GestorMenuProps {
  activeTab: string
  onTabChange: (tab: string) => void
  problemasPendentes: number
}

export function GestorMenu({ activeTab, onTabChange, problemasPendentes }: GestorMenuProps) {
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
      id: 'saques',
      label: 'Saques',
      icon: DollarSign,
      onClick: () => onTabChange('saques')
    }
  ]

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={item.onClick}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
          {item.id === 'clientes' && problemasPendentes > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {problemasPendentes}
            </Badge>
          )}
        </Button>
      ))}
    </nav>
  )
}
