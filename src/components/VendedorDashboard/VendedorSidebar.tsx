
import { User, Users, Plus, BarChart3, LogOut } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuth'

interface VendedorSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function VendedorSidebar({ activeTab, onTabChange }: VendedorSidebarProps) {
  const { user, currentManagerName, logout } = useAuth()

  const menuItems = [
    {
      title: "Dashboard",
      icon: BarChart3,
      id: "dashboard",
    },
    {
      title: "Lista de Vendas",
      icon: Users,
      id: "lista-vendas",
    },
    {
      title: "Adicionar Cliente",
      icon: Plus,
      id: "adicionar-cliente",
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 rounded-full p-2">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">{currentManagerName}</h2>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Painel do Vendedor</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
