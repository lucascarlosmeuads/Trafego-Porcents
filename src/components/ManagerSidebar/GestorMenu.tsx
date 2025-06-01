
import { BarChart3, Users, MessageCircle } from 'lucide-react'
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

interface GestorMenuProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function GestorMenu({ activeTab, onTabChange }: GestorMenuProps) {
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
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton 
                  onClick={() => onTabChange(item.id)}
                  isActive={activeTab === item.id}
                  className="w-full"
                >
                  <Icon className="w-4 h-4" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
