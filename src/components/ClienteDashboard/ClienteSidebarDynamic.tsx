import { Home, FileText, Upload, MessageCircle, TrendingUp, Settings, Users, DollarSign, LayoutDashboard, LogOut, FileCheck, Activity, Sparkles, Loader2, Headphones } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'
import { TermosContratoModal } from './TermosContratoModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ClienteSidebarDynamicProps {
  activeTab: string
  onTabChange: (tab: string) => void
  clienteInfo: any
}

export function ClienteSidebarDynamic({ activeTab, onTabChange, clienteInfo }: ClienteSidebarDynamicProps) {
  const { signOut, user } = useAuth()
  const { state } = useSidebar()
  const [termosModalOpen, setTermosModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const isCollapsed = state === 'collapsed'

  const menuItems = [
    {
      id: 'home',
      label: 'Início',
      icon: Home
    },
    {
      id: 'briefing',
      label: '1. Formulário',
      icon: FileText
    },
    {
      id: 'arquivos',
      label: '2. Materiais',
      icon: Upload
    },
    {
      id: 'suporte',
      label: '3. Suporte',
      icon: MessageCircle
    },
    {
      id: 'comissao',
      label: '4. Comissão',
      icon: DollarSign
    },
    {
      id: 'steps',
      label: '5. Guia Completo',
      icon: Users
    },
    {
      id: 'vendas',
      label: '6. Métricas',
      icon: TrendingUp
    },
    {
      id: 'site',
      label: 'Site - Não Obrigatório',
      icon: LayoutDashboard
    },
    {
      id: 'sac',
      label: 'SAC - Atendimento Urgente',
      icon: Headphones
    }
  ]

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    
    try {
      await signOut()
    } catch (error) {
      console.error('Erro no logout:', error)
      window.location.href = '/'
    }
  }

  const handleSacClick = () => {
    window.open('https://trafegoporcents.com/sac', '_blank')
  }

  return (
    <Sidebar 
      className={`bg-gradient-card border-r border-border/50 backdrop-blur-sm shadow-professional h-screen transition-all duration-300 ${
        isCollapsed ? 'w-14' : 'w-80'
      }`}
      collapsible="icon"
    >
      <SidebarHeader className={`border-b border-border/50 transition-all duration-300 ${
        isCollapsed ? 'p-2' : 'p-4'
      }`}>
        {/* Header com Trigger Sempre Visível */}
        <div className={`flex items-center transition-all duration-300 ${
          isCollapsed ? 'justify-center mb-2' : 'justify-between mb-3'
        }`}>
          <SidebarTrigger className="text-foreground hover:bg-accent rounded-lg hover-lift transition-all duration-200" />
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-trafego text-white">
                <Activity className="h-3 w-3" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Dashboard Cliente</span>
            </div>
          )}
        </div>

        {/* Logo Section Profissional */}
        {!isCollapsed && (
          <div className="mobile-optimized-card info-card-primary">
            <div className="mobile-optimized-p text-center">
              <div className="flex justify-center mb-3">
                <img 
                  src="/lovable-uploads/e1c8c342-51ea-4eb6-a6bb-b33eefaa2b53.png" 
                  alt="Tráfego Por Cents" 
                  className="h-16 w-auto object-contain hover-lift transition-transform duration-300"
                />
              </div>
              <Badge className="professional-badge text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                {user?.email?.split('@')[0]}
              </Badge>
            </div>
          </div>
        )}

        {/* Logo Mini Collapsed */}
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="mobile-optimized-card info-card-primary p-2 hover-lift">
              <img 
                src="/lovable-uploads/e1c8c342-51ea-4eb6-a6bb-b33eefaa2b53.png" 
                alt="Tráfego Por Cents" 
                className="h-8 w-auto object-contain transition-transform duration-300"
              />
            </div>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent className={`py-4 transition-all duration-300 ${
        isCollapsed ? 'px-1' : 'px-3'
      }`}>
        <SidebarMenu className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => {
                    if (item.id === 'sac') {
                      handleSacClick()
                    } else {
                      onTabChange(item.id)
                    }
                  }}
                  isActive={isActive}
                  className={cn(
                    "w-full rounded-lg transition-all duration-300 hover-lift mobile-touch-target",
                    isActive 
                      ? "bg-gradient-trafego text-white hover:bg-gradient-trafego-hover shadow-glow-blue font-semibold" 
                      : "mobile-optimized-card hover:bg-accent hover:text-accent-foreground border border-border/50",
                    isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-start'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
                    isActive 
                      ? "bg-white/20 text-white" 
                      : "bg-primary/10 text-primary"
                  )}>
                    <Icon className="h-4 w-4 flex-shrink-0" />
                  </div>
                  {!isCollapsed && (
                    <span className="text-sm font-medium ml-3">{item.label}</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className={`border-t border-border/50 space-y-3 transition-all duration-300 ${
        isCollapsed ? 'p-2 space-y-2' : 'p-3'
      }`}>
        {/* Termos de Uso Modernizado */}
        <Button
          onClick={() => setTermosModalOpen(true)}
          className={cn(
            "w-full rounded-lg info-card-warning hover-lift mobile-touch-target transition-all duration-300",
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-start'
          )}
          variant="outline"
          title={isCollapsed ? 'Termos de Uso' : undefined}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/20 text-red-600">
            <FileCheck className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full ml-3">
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                Termos de Uso
              </span>
              <Badge variant="destructive" className="text-xs px-2 py-0 animate-pulse">
                IMPORTANTE
              </Badge>
            </div>
          )}
        </Button>

        {/* Sair do Sistema */}
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "w-full rounded-lg hover:bg-destructive/10 hover:text-destructive border-destructive/30 hover:border-destructive mobile-touch-target hover-lift transition-all duration-300",
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-start'
          )}
          variant="outline"
          title={isCollapsed ? 'Sair do Sistema' : undefined}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 text-destructive">
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </div>
          {!isCollapsed && (
            <span className="text-sm font-medium text-destructive ml-3">
              {isLoggingOut ? 'Saindo...' : 'Sair do Sistema'}
            </span>
          )}
        </Button>
      </SidebarFooter>

      {/* Modal de Termos */}
      <TermosContratoModal
        open={termosModalOpen}
        onOpenChange={setTermosModalOpen}
        onTermosAceitos={() => setTermosModalOpen(false)}
        onTermosRejeitados={() => setTermosModalOpen(false)}
      />
    </Sidebar>
  )
}
