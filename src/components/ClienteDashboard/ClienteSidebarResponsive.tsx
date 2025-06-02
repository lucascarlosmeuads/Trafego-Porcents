
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
    <Sidebar 
      collapsible="icon" 
      className="border-r border-trafego-border-subtle"
      style={{backgroundColor: '#111827'}}
    >
      <SidebarHeader className="border-b border-trafego-border-subtle">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-trafego text-white shadow-lg">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-trafego-text-primary">Painel do Cliente</span>
            <span className="text-xs text-trafego-text-secondary truncate">
              {currentManagerName || 'Cliente'}
            </span>
          </div>
        </div>
        
        {/* Perfil do usuário - visível apenas quando expandido */}
        <div 
          className="flex items-center space-x-3 p-3 rounded-xl mx-2 group-data-[collapsible=icon]:hidden shadow-sm border border-trafego-border-subtle/50"
          style={{backgroundColor: '#1f2937'}}
        >
          <Avatar className="h-10 w-10 shadow-md">
            <AvatarFallback className="bg-gradient-trafego text-white font-semibold">
              {currentManagerName ? getInitials(currentManagerName) : <User className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-trafego-text-primary truncate">
              {currentManagerName || 'Usuário'}
            </p>
            <p className="text-xs text-trafego-text-muted truncate">
              {user?.email || 'Carregando...'}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-trafego-text-secondary font-medium uppercase tracking-wider text-xs">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleTabChange(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.label}
                    className={`w-full transition-all duration-200 hover:scale-[1.02] ${
                      activeTab === item.id 
                        ? 'bg-gradient-trafego text-white shadow-lg shadow-trafego-accent-primary/20 border border-trafego-accent-primary/30' 
                        : 'text-trafego-text-primary hover:bg-trafego-bg-card hover:text-white border border-transparent hover:border-trafego-border-subtle'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                      <span className="font-semibold">{item.label}</span>
                      <span className={`text-xs ${
                        activeTab === item.id ? 'text-white/90' : 'text-trafego-text-muted'
                      }`}>
                        {item.description}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-trafego-border-subtle">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              disabled={isSigningOut}
              tooltip="Sair do Sistema"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-red-500/30"
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden font-medium">
                {isSigningOut ? 'Saindo...' : 'Sair do Sistema'}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
