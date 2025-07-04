
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { ClienteProfileSection } from './ClienteProfileSection'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TermosContratoModal } from './TermosContratoModal'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'
import { useAuth } from '@/hooks/useAuth'
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from '@/components/ui/sidebar'
import { 
  FileText, 
  Upload, 
  Headphones, 
  DollarSign,
  Globe,
  BarChart3,
  CheckSquare,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Loader2
} from 'lucide-react'

interface ClienteSidebarDynamicProps {
  activeTab: string
  onTabChange: (tab: string) => void
  clienteInfo: any
}

export function ClienteSidebarDynamic({ activeTab, onTabChange, clienteInfo }: ClienteSidebarDynamicProps) {
  const { termosAceitos, clienteAntigo, marcarTermosAceitos, marcarTermosRejeitados } = useTermosAceitos()
  const { signOut } = useAuth()
  const { state } = useSidebar()
  const [termosModalOpen, setTermosModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const menuItems = [
    {
      id: 'briefing',
      label: '1. Formulário',
      icon: FileText,
      badge: null,
      step: 1
    },
    {
      id: 'arquivos',
      label: '2. Materiais',
      icon: Upload,
      badge: null,
      step: 2
    },
    {
      id: 'suporte',
      label: '3. Suporte',
      icon: Headphones,
      badge: null,
      step: 3
    },
    {
      id: 'comissao',
      label: '4. Comissão',
      icon: DollarSign,
      badge: clienteInfo?.comissao_confirmada ? 'confirmed' : null,
      step: 4
    },
    {
      id: 'site',
      label: '5. Site (Opcional)',
      icon: Globe,
      badge: clienteInfo?.site_descricao_personalizada ? 'described' : 'optional',
      step: 5
    },
    {
      id: 'vendas',
      label: '6. Métricas',
      icon: BarChart3,
      badge: null,
      step: 6
    },
    {
      id: 'steps',
      label: 'Guia Completo',
      icon: CheckSquare,
      badge: null
    }
  ]

  const getBadgeContent = (badge: string | null) => {
    switch (badge) {
      case 'confirmed':
        return <CheckCircle className="w-3 h-3 text-green-400" />
      case 'described':
        return <CheckCircle className="w-3 h-3 text-purple-400" />
      case 'optional':
        return <span className="text-xs text-purple-400">Opc</span>
      default:
        return null
    }
  }

  const handleTermosClick = () => {
    setTermosModalOpen(true)
  }

  const handleTermosAceitos = async () => {
    try {
      await marcarTermosAceitos()
      setTermosModalOpen(false)
    } catch (error) {
      console.error('Erro ao aceitar termos:', error)
    }
  }

  const handleTermosRejeitados = async () => {
    try {
      await marcarTermosRejeitados()
      setTermosModalOpen(false)
    } catch (error) {
      console.error('Erro ao rejeitar termos:', error)
    }
  }

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Erro no logout:', error)
      setIsLoggingOut(false)
    }
  }

  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        {/* Profile Section */}
        {!isCollapsed && (
          <div className="p-4 border-b border-border">
            <ClienteProfileSection />
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      isActive={isActive}
                      className="h-12"
                    >
                      <Icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.badge && (
                            <div className="flex-shrink-0">
                              {getBadgeContent(item.badge)}
                            </div>
                          )}
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}

              {/* Termos de Uso */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleTermosClick}
                  className="h-12 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border border-red-200 dark:border-red-800/30 hover:from-red-100 hover:to-red-150 dark:hover:from-red-900/30 dark:hover:to-red-800/30"
                >
                  <div className="relative">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <FileText className="h-3 w-3 text-red-600 dark:text-red-400 absolute -bottom-1 -right-1" />
                  </div>
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        Termos de Uso
                      </span>
                      <Badge 
                        variant="destructive" 
                        className="text-xs px-2 py-0 bg-red-600 text-white shadow-lg animate-pulse"
                      >
                        IMPORTANTE
                      </Badge>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Sair do Sistema */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="h-12 hover:bg-destructive hover:text-destructive-foreground border-destructive/20 hover:border-destructive"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  {!isCollapsed && (
                    <span className="text-sm font-medium">
                      {isLoggingOut ? 'Saindo...' : 'Sair do Sistema'}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status da Campanha */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t border-border">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3 border border-border">
              <div className="text-xs font-medium text-foreground mb-1">
                Status da Campanha:
              </div>
              <div className="text-sm font-semibold text-primary">
                {clienteInfo?.status_campanha || 'Em Configuração'}
              </div>
              {!clienteInfo?.status_campanha?.includes('Ativa') && (
                <div className="text-xs text-muted-foreground mt-1">
                  Complete os passos para ativar
                </div>
              )}
            </div>
          </div>
        )}
      </SidebarContent>

      {/* Modal de Termos */}
      <TermosContratoModal
        open={termosModalOpen}
        onOpenChange={setTermosModalOpen}
        onTermosAceitos={handleTermosAceitos}
        onTermosRejeitados={handleTermosRejeitados}
        showOnlyAccept={termosAceitos || clienteAntigo}
      />
    </Sidebar>
  )
}
