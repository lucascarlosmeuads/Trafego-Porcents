
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
  SidebarMenuButton
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
  const [termosModalOpen, setTermosModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
    <Sidebar className="bg-background border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        {/* Logo Section - Clean and Simple */}
        <div className="flex flex-col items-center space-y-3">
          <img 
            src="/lovable-uploads/e1c8c342-51ea-4eb6-a6bb-b33eefaa2b53.png" 
            alt="Tráfego Por Cents" 
            className="h-12 w-auto object-contain"
          />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {clienteInfo?.nome_cliente || 'Cliente'}
            </p>
            <p className="text-xs text-muted-foreground opacity-60">
              {user?.email}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => onTabChange(item.id)}
                  isActive={isActive}
                  className="w-full justify-start rounded-lg px-3 py-2.5 text-foreground hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                >
                  <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-2 border-t border-border space-y-2">
        {/* Status da Campanha */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-3 border border-border/50">
          <div className="text-xs font-medium text-foreground mb-1">
            Status da Campanha:
          </div>
          <div className="text-sm font-semibold text-primary">
            {clienteInfo?.status_campanha || 'Em Configuração'}
          </div>
        </div>

        {/* Termos de Uso */}
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setTermosModalOpen(true)}
            className="w-full justify-start rounded-lg px-3 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/30"
          >
            <FileCheck className="h-4 w-4 mr-3 text-red-600 dark:text-red-400" />
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                Termos de Uso
              </span>
              <Badge variant="destructive" className="text-xs px-2 py-0">
                IMPORTANTE
              </Badge>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* WhatsApp Suporte */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a 
              href="https://wa.me/5511940747924" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full justify-start rounded-lg px-3 py-2.5 text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <MessageCircle className="h-4 w-4 mr-3" />
              <span className="text-sm font-medium">Precisa de ajuda?</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Sair do Sistema */}
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full justify-start rounded-lg px-3 py-2.5 hover:bg-destructive hover:text-destructive-foreground border border-destructive/20 hover:border-destructive"
          >
            <LogOut className="h-4 w-4 mr-3 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {isLoggingOut ? 'Saindo...' : 'Sair do Sistema'}
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
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
