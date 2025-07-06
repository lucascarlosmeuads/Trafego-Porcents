import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TermosContratoModal } from './TermosContratoModal'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'
import { useAuth } from '@/hooks/useAuth'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
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
  Loader2,
  Menu,
  ChevronLeft,
  Sparkles,
  Activity
} from 'lucide-react'

interface MobileSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  clienteInfo: any
}

export function MobileSidebar({ activeTab, onTabChange, clienteInfo }: MobileSidebarProps) {
  const { termosAceitos, clienteAntigo, marcarTermosAceitos, marcarTermosRejeitados } = useTermosAceitos()
  const { signOut, user } = useAuth()
  const [termosModalOpen, setTermosModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [open, setOpen] = useState(false)

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
      id: 'vendas',
      label: '5. Métricas',
      icon: BarChart3,
      badge: null,
      step: 5
    },
    {
      id: 'site',
      label: 'Site - Não Obrigatório',
      icon: Globe,
      badge: clienteInfo?.site_descricao_personalizada ? 'described' : 'optional'
    },
    {
      id: 'sac',
      label: 'SAC - Atendimento Urgente',
      icon: Headphones,
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

  const handleMenuItemClick = (tab: string) => {
    if (tab === 'sac') {
      window.open('https://trafegoporcents.com/sac', '_blank')
    } else {
      onTabChange(tab)
    }
    setOpen(false)
  }

  const closeMenu = () => {
    setOpen(false)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mobile-optimized-card bg-gradient-card hover:shadow-card-hover hover-lift border-border/50 transition-all duration-300"
          >
            <Menu className="mobile-icon-sm text-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-80 p-0 bg-gradient-card border-r border-border/50 backdrop-blur-sm shadow-professional [&>button]:hidden"
        >
          <div className="flex flex-col h-full">
            {/* Header Profissional com Logo no Topo */}
            <div className="mobile-optimized-card info-card-primary border-b border-border/50">
              <div className="mobile-optimized-p">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-trafego text-white">
                      <Activity className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-foreground text-sm">Dashboard Cliente</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeMenu}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 hover-lift"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Logo Centralizada e Profissional */}
                <div className="flex justify-center w-full mb-4">
                  <img 
                    src="/lovable-uploads/e1c8c342-51ea-4eb6-a6bb-b33eefaa2b53.png" 
                    alt="Tráfego Por Cents" 
                    className="h-16 w-auto object-contain hover-lift transition-transform duration-300"
                  />
                </div>
                
                {/* Email Badge Profissional */}
                <div className="flex justify-center">
                  <Badge className="professional-badge text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {user?.email?.split('@')[0]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Menu Items com Design das Métricas */}
            <div className="flex-1 overflow-y-auto mobile-optimized-p mobile-optimized-spacing">
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left mobile-touch-target mobile-optimized-card hover-lift transition-all duration-300",
                        isActive 
                          ? "bg-gradient-trafego text-white hover:bg-gradient-trafego-hover shadow-glow-blue font-semibold transform scale-[1.02]" 
                          : "hover:bg-accent hover:text-accent-foreground bg-gradient-card border border-border/50"
                      )}
                      onClick={() => handleMenuItemClick(item.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
                            isActive 
                              ? "bg-white/20 text-white" 
                              : "bg-primary/10 text-primary"
                          )}>
                            <Icon className="mobile-icon-sm" />
                          </div>
                          <span className="mobile-description font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <div className="flex-shrink-0">
                            {getBadgeContent(item.badge)}
                          </div>
                        )}
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Footer Profissional */}
            <div className="mobile-optimized-p border-t border-border/50 space-y-3 bg-gradient-card">
              {/* Termos de Uso Modernizado */}
              <Button
                variant="ghost"
                className="w-full justify-start mobile-touch-target info-card-warning hover-lift transition-all duration-300"
                onClick={handleTermosClick}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/20 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <span className="mobile-description font-medium text-red-700 dark:text-red-300">
                      Termos de Uso
                    </span>
                  </div>
                  <Badge variant="destructive" className="text-xs px-2 py-0 animate-pulse">
                    IMPORTANTE
                  </Badge>
                </div>
              </Button>

              {/* Status da Campanha */}
              <div className="mobile-optimized-card info-card-success">
                <div className="mobile-optimized-p">
                  <div className="mobile-description font-medium text-green-900 dark:text-green-100 mb-1">
                    Status da Campanha:
                  </div>
                  <div className="font-semibold text-green-700 dark:text-green-300 text-sm">
                    {clienteInfo?.status_campanha || 'Em Configuração'}
                  </div>
                  {!clienteInfo?.status_campanha?.includes('Ativa') && (
                    <div className="mobile-description text-green-600 dark:text-green-400 mt-1">
                      Complete os passos para ativar
                    </div>
                  )}
                </div>
              </div>

              {/* Botão Sair Modernizado */}
              <Button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                variant="outline"
                className="w-full justify-start mobile-touch-target hover:bg-destructive/10 hover:text-destructive border-destructive/30 hover:border-destructive transition-all duration-300 hover-lift"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 text-destructive">
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                  </div>
                  <span className="mobile-description font-medium text-destructive">
                    {isLoggingOut ? 'Saindo...' : 'Sair do Sistema'}
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de Termos */}
      <TermosContratoModal
        open={termosModalOpen}
        onOpenChange={setTermosModalOpen}
        onTermosAceitos={handleTermosAceitos}
        onTermosRejeitados={handleTermosRejeitados}
        showOnlyAccept={termosAceitos || clienteAntigo}
      />
    </>
  )
}
