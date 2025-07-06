
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
            {/* Header Compacto */}
            <div className="mobile-optimized-card info-card-primary border-b border-border/50 p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-trafego text-white">
                    <Activity className="h-3 w-3" />
                  </div>
                  <span className="font-semibold text-foreground text-sm">Dashboard</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMenu}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 hover-lift h-7 w-7"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Logo Compacta */}
              <div className="flex justify-center mb-3">
                <img 
                  src="/lovable-uploads/e1c8c342-51ea-4eb6-a6bb-b33eefaa2b53.png" 
                  alt="Tráfego Por Cents" 
                  className="h-12 w-auto object-contain"
                />
              </div>
              
              {/* Email Badge Compacto */}
              <div className="flex justify-center">
                <Badge className="professional-badge text-xs px-2 py-1">
                  <Sparkles className="h-2 w-2 mr-1" />
                  {user?.email?.split('@')[0]}
                </Badge>
              </div>
            </div>

            {/* Área de Scroll Única - Inclui Menu + Rodapé */}
            <div className="flex-1 overflow-y-auto">
              {/* Menu Items Principais */}
              <div className="p-3 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left mobile-touch-target mobile-optimized-card hover-lift transition-all duration-300 py-2.5",
                        isActive 
                          ? "bg-gradient-trafego text-white hover:bg-gradient-trafego-hover shadow-glow-blue font-semibold transform scale-[1.02]" 
                          : "hover:bg-accent hover:text-accent-foreground bg-gradient-card border border-border/50"
                      )}
                      onClick={() => handleMenuItemClick(item.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-200",
                            isActive 
                              ? "bg-white/20 text-white" 
                              : "bg-primary/10 text-primary"
                          )}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-medium">{item.label}</span>
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

              {/* Rodapé Scrollável - Agora dentro da área de scroll */}
              <div className="p-3 space-y-2 border-t border-border/30 mt-4">
                {/* Termos de Uso Compacto */}
                <Button
                  variant="ghost"
                  className="w-full justify-start mobile-touch-target hover-lift transition-all duration-300 py-2 bg-red-50 hover:bg-red-100 border border-red-200"
                  onClick={handleTermosClick}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-500/20 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium text-red-700">Termos</span>
                    </div>
                    <Badge variant="destructive" className="text-xs px-1.5 py-0 h-4">
                      !
                    </Badge>
                  </div>
                </Button>

                {/* Status da Campanha Compacto */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <div className="text-xs font-medium text-green-800 mb-0.5">
                    Status: <span className="font-semibold">{clienteInfo?.status_campanha || 'Em Config'}</span>
                  </div>
                  {!clienteInfo?.status_campanha?.includes('Ativa') && (
                    <div className="text-xs text-green-600">
                      Complete os passos
                    </div>
                  )}
                </div>

                {/* Botão Sair Compacto */}
                <Button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  variant="outline"
                  className="w-full justify-start mobile-touch-target hover:bg-destructive/10 hover:text-destructive border-destructive/20 hover:border-destructive transition-all duration-300 hover-lift py-2"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-destructive/10 text-destructive">
                      {isLoggingOut ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <LogOut className="h-3 w-3" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-destructive">
                      {isLoggingOut ? 'Saindo...' : 'Sair'}
                    </span>
                  </div>
                </Button>
              </div>
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
