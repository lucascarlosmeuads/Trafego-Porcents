
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { ClienteProfileSection } from './ClienteProfileSection'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TermosContratoModal } from './TermosContratoModal'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'
import { useAuth } from '@/hooks/useAuth'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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
  X
} from 'lucide-react'

interface MobileSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  clienteInfo: any
}

export function MobileSidebar({ activeTab, onTabChange, clienteInfo }: MobileSidebarProps) {
  const { termosAceitos, clienteAntigo, marcarTermosAceitos, marcarTermosRejeitados } = useTermosAceitos()
  const { signOut } = useAuth()
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

  const handleMenuItemClick = (tab: string) => {
    onTabChange(tab)
    setOpen(false) // Fecha o menu automaticamente
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
            className="md:hidden hover:bg-gray-800 transition-colors duration-200"
          >
            <Menu className="h-5 w-5 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-80 p-0 bg-gray-900 border-r border-gray-800"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de Navegação</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-full">
            {/* Header com botão fechar customizado */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/e1c8c342-51ea-4eb6-a6bb-b33eefaa2b53.png" 
                  alt="Tráfego Por Cents" 
                  className="h-8 w-auto object-contain"
                />
                <span className="text-white font-semibold">Menu</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMenu}
                className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Profile Section */}
            <div className="p-4 border-b border-gray-800">
              <ClienteProfileSection />
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left h-auto py-3 px-3 text-white hover:bg-gray-800 hover:text-white transition-all duration-200 rounded-lg",
                        isActive && "bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform scale-[1.02]"
                      )}
                      onClick={() => handleMenuItemClick(item.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Icon className={cn(
                            "h-4 w-4 flex-shrink-0 transition-colors duration-200",
                            isActive ? "text-white" : "text-gray-400"
                          )} />
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

                {/* Divisor */}
                <div className="my-4 border-t border-gray-800"></div>

                {/* Termos de Uso */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-3 px-3 bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-700/50 hover:from-red-800/40 hover:to-red-700/40 transition-all duration-200 rounded-lg"
                  onClick={handleTermosClick}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <FileText className="h-3 w-3 text-red-400 absolute -bottom-1 -right-1" />
                      </div>
                      <span className="text-sm font-medium text-red-300">
                        Termos de Uso
                      </span>
                    </div>
                    <Badge 
                      variant="destructive" 
                      className="text-xs px-2 py-0 bg-red-600 text-white shadow-lg animate-pulse"
                    >
                      IMPORTANTE
                    </Badge>
                  </div>
                </Button>
              </div>
            </div>

            {/* Status da Campanha */}
            <div className="p-4 border-t border-gray-800 space-y-4">
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-3 border border-gray-700">
                <div className="text-xs font-medium text-gray-300 mb-1">
                  Status da Campanha:
                </div>
                <div className="text-sm font-semibold text-blue-400">
                  {clienteInfo?.status_campanha || 'Em Configuração'}
                </div>
                {!clienteInfo?.status_campanha?.includes('Ativa') && (
                  <div className="text-xs text-gray-400 mt-1">
                    Complete os passos para ativar
                  </div>
                )}
              </div>

              {/* Botão Sair */}
              <Button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-3 hover:bg-red-600/20 hover:text-red-400 border-red-700/50 hover:border-red-600 transition-all duration-200 rounded-lg"
              >
                <div className="flex items-center gap-3 w-full">
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                  ) : (
                    <LogOut className="h-4 w-4 text-red-400" />
                  )}
                  <span className="text-sm font-medium text-red-400">
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
