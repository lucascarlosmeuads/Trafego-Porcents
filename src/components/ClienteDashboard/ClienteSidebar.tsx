
import { BarChart3, DollarSign, Folder, GraduationCap, FileText } from 'lucide-react'
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
} from '@/components/ui/sidebar'

interface ClienteSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ClienteSidebar({ activeTab, onTabChange }: ClienteSidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: BarChart3,
    },
    {
      id: 'vendas',
      title: 'Vendas',
      icon: DollarSign,
    },
    {
      id: 'briefing',
      title: 'Briefing',
      icon: FileText,
    },
    {
      id: 'materiais',
      title: 'Criativos',
      icon: Folder,
    },
    {
      id: 'tutorial',
      title: 'Tutorial',
      icon: GraduationCap,
    },
  ]

  return (
    <Sidebar className="w-64">
      <SidebarHeader>
        <div className="px-4 py-3">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Painel do Cliente</h2>
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
                    isActive={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                    className="w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium"
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
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
