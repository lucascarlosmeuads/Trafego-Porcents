
import { BarChart3, DollarSign, Folder, GraduationCap, FileText, Home } from 'lucide-react'
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
import { useIsMobile } from '@/hooks/use-mobile'

interface ClienteSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ClienteSidebar({ activeTab, onTabChange }: ClienteSidebarProps) {
  const isMobile = useIsMobile()
  
  const menuItems = [
    {
      id: 'welcome',
      title: 'Início',
      description: 'Acompanhe seu passo a passo aqui',
      icon: Home,
      priority: true,
    },
    {
      id: 'briefing',
      title: 'Briefing',
      description: 'Preencha seus dados',
      icon: FileText,
      priority: false,
    },
    {
      id: 'materiais',
      title: 'Criativos',
      description: 'Envie seus materiais',
      icon: Folder,
      priority: false,
    },
    {
      id: 'vendas',
      title: 'Vendas',
      description: 'Acompanhe seus resultados',
      icon: BarChart3,
      priority: false,
    },
    {
      id: 'tutorial',
      title: 'Tutorial',
      description: 'Aprenda a usar a plataforma',
      icon: GraduationCap,
      priority: false,
    },
  ]

  return (
    <Sidebar className={`${isMobile ? 'w-full' : 'w-64'}`}>
      <SidebarHeader>
        <div className="px-4 py-3">
          <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-sidebar-foreground`}>
            Painel do Cliente
          </h2>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
            Navegue pelos seus materiais
          </p>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isMobile ? 'text-sm' : ''}>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = activeTab === item.id
                const isPriority = item.priority
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onTabChange(item.id)}
                      tooltip={item.description}
                      className={`w-full justify-start gap-3 transition-all ${
                        isMobile 
                          ? 'px-3 py-3 text-base font-medium min-h-[48px]' 
                          : 'px-4 py-2.5 text-sm font-medium'
                      } ${
                        isPriority 
                          ? `${isActive 
                              ? 'bg-primary text-primary-foreground shadow-md' 
                              : 'bg-accent/50 hover:bg-accent border border-primary/20'
                            } font-semibold`
                          : isActive 
                            ? 'bg-accent text-accent-foreground' 
                            : 'hover:bg-accent/50'
                      }`}
                    >
                      <item.icon className={`${
                        isMobile ? 'w-5 h-5' : 'w-4 h-4'
                      } flex-shrink-0 ${
                        isPriority && isActive ? 'text-primary-foreground' : ''
                      }`} />
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="truncate font-medium">{item.title}</span>
                        {!isMobile && (
                          <span className={`text-xs truncate ${
                            isPriority && isActive 
                              ? 'text-primary-foreground/80' 
                              : 'text-muted-foreground'
                          }`}>
                            {item.description}
                          </span>
                        )}
                      </div>
                      {isPriority && (
                        <div className={`w-2 h-2 rounded-full ${
                          isActive ? 'bg-primary-foreground' : 'bg-primary'
                        } flex-shrink-0`} />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
