
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { 
  BarChart3, 
  FileText, 
  Upload, 
  TrendingUp, 
  PlayCircle,
  MessageCircle,
  LogOut,
  User
} from 'lucide-react'

interface ClienteSidebarResponsiveProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ClienteSidebarResponsive({ activeTab, onTabChange }: ClienteSidebarResponsiveProps) {
  const { user, currentManagerName, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { setOpenMobile } = useSidebar()

  const menuItems = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: BarChart3,
      description: 'Status da sua campanha'
    },
    {
      id: 'briefing',
      label: 'Briefing',
      icon: FileText,
      description: 'Formulário do briefing'
    },
    {
      id: 'arquivos',
      label: 'Arquivos',
      icon: Upload,
      description: 'Upload de materiais'
    },
    {
      id: 'vendas',
      label: 'Vendas',
      icon: TrendingUp,
      description: 'Registrar suas vendas'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      description: 'Conversar com seu gestor'
    },
    {
      id: 'tutoriais',
      label: 'Tutoriais',
      icon: PlayCircle,
      description: 'Vídeos de ajuda'
    }
  ]

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    // Fechar sidebar mobile após seleção
    setOpenMobile(false)
  }

  // Função para gerar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Painel do Cliente</span>
            <span className="text-xs text-muted-foreground truncate">
              {currentManagerName || 'Cliente'}
            </span>
          </div>
        </div>
        
        {/* Perfil do usuário - visível apenas quando expandido */}
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50 mx-2 group-data-[collapsible=icon]:hidden">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {currentManagerName ? getInitials(currentManagerName) : <User className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-card-foreground truncate">
              {currentManagerName || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'Carregando...'}
            </p>
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
                    onClick={() => handleTabChange(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.label}
                    className="w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              disabled={isSigningOut}
              tooltip="Sair do Sistema"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                {isSigningOut ? 'Saindo...' : 'Sair do Sistema'}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
