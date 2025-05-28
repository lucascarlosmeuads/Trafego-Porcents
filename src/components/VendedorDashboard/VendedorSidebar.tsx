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
} from "@/components/ui/sidebar"
import { BarChart3, Users, UserPlus } from "lucide-react"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"

interface VendedorSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function VendedorSidebar({ activeTab, onTabChange }: VendedorSidebarProps) {
  const { currentManagerName } = useSimpleAuth()

  const menuItems = [
    {
      title: "Dashboard",
      icon: BarChart3,
      id: "dashboard"
    },
    {
      title: "Lista de Vendas",
      icon: Users,
      id: "lista-vendas"
    },
    {
      title: "Adicionar Cliente",
      icon: UserPlus,
      id: "adicionar-cliente"
    }
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Painel Vendedor</span>
            <span className="text-xs text-muted-foreground truncate">{currentManagerName}</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    className="w-full justify-start"
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
    </Sidebar>
  )
}
