
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

          {/* Item destacado para Termos de Uso */}
          <Button
            variant="ghost"
            className="w-full justify-start text-left h-auto py-3 border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-200 hover:text-orange-100 animate-pulse"
            onClick={handleAbrirTermos}
          >
            <div className="flex items-center w-full">
              <div className="flex items-center gap-1 mr-3">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <FileText className="h-5 w-5 text-orange-400" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="font-medium">Termos de Uso</div>
                  <div className="text-xs opacity-70">Revisar condições importantes</div>
                </div>
                <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-300 border-orange-500/40">
                  Importante
                </Badge>
              </div>
            </div>
          </Button>
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
