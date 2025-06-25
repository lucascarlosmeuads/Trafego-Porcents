
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  BarChart3, 
  FileText, 
  Upload, 
  TrendingUp, 
  PlayCircle,
  MessageCircle,
  LogOut,
  User,
  AlertTriangle
} from 'lucide-react'
import { TermosContratoModal } from './TermosContratoModal'

interface ClienteSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

// DEPRECATED: Use ClienteSidebarResponsive instead
// This component is kept for backward compatibility
export function ClienteSidebar({ activeTab, onTabChange }: ClienteSidebarProps) {
  const { user, currentManagerName, signOut } = useAuth()
  const { marcarTermosAceitos, marcarTermosRejeitados } = useTermosAceitos()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [termosModalOpen, setTermosModalOpen] = useState(false)

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

  const handleAbrirTermos = () => {
    setTermosModalOpen(true)
  }

  const handleTermosAceitos = () => {
    marcarTermosAceitos()
  }

  const handleTermosRejeitados = () => {
    marcarTermosRejeitados()
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
    <>
      <aside className="w-64 bg-card border-r border-border flex-col hidden lg:flex">
        {/* Header com informações do usuário */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-card-foreground mb-4">Painel do Cliente</h2>
          
          {/* Perfil do usuário */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50">
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
        </div>
        
        {/* Menu de navegação */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={`w-full justify-start text-left h-auto py-3 ${
                activeTab === item.id 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'text-card-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <div className="flex items-center">
                <item.icon className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </div>
            </Button>
          ))}

          {/* Item ULTRA DESTACADO para Termos de Uso */}
          <div className="relative mt-4 p-2">
            {/* Efeito de glow/brilho no fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 rounded-xl blur-lg opacity-40 animate-ultra-pulse"></div>
            
            {/* Seta piscante apontando para o item */}
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 text-yellow-400 animate-bounce-intense z-10">
              <span className="text-2xl">👉</span>
            </div>
            
            <Button
              variant="ghost"
              className="relative w-full justify-start text-left h-auto py-4 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-700 hover:via-red-600 hover:to-orange-600 text-white border-2 border-yellow-400 rounded-xl shadow-2xl animate-shake-subtle hover:scale-105 transition-all duration-300"
              onClick={handleAbrirTermos}
            >
              <div className="flex items-center w-full">
                <div className="flex items-center gap-2 mr-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-300 animate-bounce" />
                  <FileText className="h-6 w-6 text-yellow-300" />
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-yellow-100 text-base">🔥 TERMOS DE USO 🔥</div>
                    <div className="text-sm text-yellow-200 font-medium mt-1">AÇÃO NECESSÁRIA - CLIQUE AQUI!</div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Badge className="text-sm bg-yellow-500 text-black border-yellow-400 font-bold animate-pulse px-3 py-1 shadow-lg">
                      URGENTE
                    </Badge>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
              
              {/* Efeito de spotlight no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-full group-hover:animate-spotlight rounded-xl"></div>
            </Button>
            
            {/* Badge "NOVO" piscante */}
            <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full border-2 border-white animate-bounce-intense shadow-xl z-10">
              NOVO
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="mr-3 h-5 w-5" />
            {isSigningOut ? 'Saindo...' : 'Sair do Sistema'}
          </Button>
        </div>
      </aside>

      {/* Modal de Termos */}
      <TermosContratoModal
        open={termosModalOpen}
        onOpenChange={setTermosModalOpen}
        onTermosAceitos={handleTermosAceitos}
        onTermosRejeitados={handleTermosRejeitados}
      />
    </>
  )
}
