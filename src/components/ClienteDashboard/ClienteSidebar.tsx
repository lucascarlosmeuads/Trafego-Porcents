
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  FileText, 
  Upload, 
  TrendingUp, 
  PlayCircle,
  MessageCircle,
  LogOut
} from 'lucide-react'

interface ClienteSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ClienteSidebar({ activeTab, onTabChange }: ClienteSidebarProps) {
  const { signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Painel do Cliente</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'default' : 'ghost'}
            className="w-full justify-start text-left h-auto py-3"
            onClick={() => onTabChange(item.id)}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </div>
          </Button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {isSigningOut ? 'Saindo...' : 'Sair do Sistema'}
        </Button>
      </div>
    </aside>
  )
}
