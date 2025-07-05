
import { Home, FileText, Upload, MessageCircle, TrendingUp, Settings, Users, DollarSign, LayoutDashboard, LogOut, FileCheck } from 'lucide-react'
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
      id: 'site',
      label: '5. Site',
      icon: LayoutDashboard
    },
    {
      id: 'vendas',
      label: '6. Métricas',
      icon: TrendingUp
    },
    {
      id: 'steps',
      label: 'Guia Completo',
      icon: Users
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

  return (
    <Sidebar 
      className={`bg-background border-r border-border h-screen transition-all duration-300 shadow-sm ${
        isCollapsed ? 'w-14' : 'w-80'
      }`}
      collapsible="icon"
    >
      <SidebarHeader className={`border-b border-border transition-all duration-300 ${
        isCollapsed ? 'p-2' : 'p-6'
      }`}>
        {/* SidebarTrigger sempre visível */}
        <div className={`flex items-center transition-all duration-300 ${
          isCollapsed ? 'justify-center mb-2' : 'justify-between mb-4'
        }`}>
          <SidebarTrigger className="text-foreground hover:bg-accent rounded-md" />
          {!isCollapsed && (
            <div className="text-xs text-muted-foreground">
              Dashboard Cliente
            </div>
          )}
        </div>

        {/* Logo Section - Adaptativo ao estado collapsed */}
        {!isCollapsed && (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="w-full flex justify-center py-3">
              <img 
                src="/lovable-uploads/e1c8c342-51ea-4eb6-a6bb-b33eefaa2b53.png" 
                alt="Tráfego Por Cents" 
                className="h-32 w-auto object-contain"
              />
            </div>
            <div className="text-center w-full px-2">
              <p className="text-xs text-muted-foreground opacity-60 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        )}

        {/* Logo mini quando collapsed */}
        {isCollapsed && (
          <div className="flex justify-center py-2">
            <img 
              src="/lovable-uploads/e1c8c342-51ea-4eb6-a6bb-b33eefaa2b53.png" 
              alt="Tráfego Por Cents" 
              className="h-8 w-auto object-contain"
            />
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent className={`py-4 transition-all duration-300 ${
        isCollapsed ? 'px-1' : 'px-4'
      }`}>
        <SidebarMenu className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => onTabChange(item.id)}
                  isActive={isActive}
                  className={`w-full rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground transition-all duration-200 ${
                    isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-start'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className={`border-t border-border space-y-3 transition-all duration-300 ${
        isCollapsed ? 'p-2 space-y-2' : 'p-4'
      }`}>
        {/* Termos de Uso */}
        <Button
          onClick={() => setTermosModalOpen(true)}
          className={`w-full rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/30 h-auto transition-all duration-200 ${
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-start'
          }`}
          variant="outline"
          title={isCollapsed ? 'Termos de Uso' : undefined}
        >
          <FileCheck className={`h-4 w-4 text-red-600 dark:text-red-400 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                Termos de Uso
              </span>
              <Badge variant="destructive" className="text-xs px-2 py-0">
                IMPORTANTE
              </Badge>
            </div>
          )}
        </Button>

        {/* WhatsApp Suporte */}
        <Button
          asChild
          className={`w-full rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground h-auto transition-all duration-200 ${
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-start'
          }`}
          variant="outline"
        >
          <a 
            href="https://wa.me/5511940747924" 
            target="_blank" 
            rel="noopener noreferrer"
            title={isCollapsed ? 'Precisa de ajuda?' : undefined}
          >
            <MessageCircle className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && (
              <span className="text-sm font-medium">Precisa de ajuda?</span>
            )}
          </a>
        </Button>

        {/* Sair do Sistema */}
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full rounded-lg hover:bg-destructive hover:text-destructive-foreground border border-destructive/20 hover:border-destructive h-auto transition-all duration-200 ${
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-start'
          }`}
          variant="outline"
          title={isCollapsed ? 'Sair do Sistema' : undefined}
        >
          <LogOut className={`h-4 w-4 text-destructive ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && (
            <span className="text-sm font-medium text-destructive">
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
