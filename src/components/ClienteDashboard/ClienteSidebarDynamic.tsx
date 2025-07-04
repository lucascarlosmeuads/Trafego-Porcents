
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
import { ClienteProfileSection } from './ClienteProfileSection'

interface ClienteSidebarDynamicProps {
  activeTab: string
  onTabChange: (tab: string) => void
  clienteInfo: any
}

export function ClienteSidebarDynamic({ activeTab, onTabChange, clienteInfo }: ClienteSidebarDynamicProps) {
  const { signOut } = useAuth()
  const [termosModalOpen, setTermosModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const menuItems = [
    {
      id: 'home',
      label: 'Início',
      icon: Home,
      description: 'Dashboard principal e progresso'
    },
    {
      id: 'briefing',
      label: 'Briefing',
      icon: FileText,
      description: 'Informações do projeto'
    },
    {
      id: 'arquivos',
      label: 'Materiais',
      icon: Upload,
      description: 'Upload de arquivos'
    },
    {
      id: 'suporte',
      label: 'Suporte',
      icon: MessageCircle,
      description: 'Tire suas dúvidas'
    },
    {
      id: 'vendas',
      label: 'Vendas',
      icon: TrendingUp,
      description: 'Métricas da campanha'
    },
    {
      id: 'comissao',
      label: 'Comissão',
      icon: DollarSign,
      description: 'Detalhes da comissão'
    },
    {
      id: 'site',
      label: 'Site',
      icon: LayoutDashboard,
      description: 'Informações do site'
    },
    {
      id: 'steps',
      label: 'Tutoriais',
      icon: Users,
      description: 'Vídeos e guias'
    }
  ]

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    
    try {
      await signOut()
    } catch (error) {
      console.error('Erro no logout:', error)
      // Fallback: forçar redirecionamento
      window.location.href = '/'
    }
  }

  return (
    <Sidebar className="bg-gray-950 border-r border-gray-800">
      <SidebarHeader>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TP</span>
          </div>
          <h4 className="font-semibold text-sm text-white">
            {clienteInfo?.nome_cliente || 'Cliente'}
          </h4>
        </div>
        
        {/* Seção de Perfil do Cliente */}
        <ClienteProfileSection />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onTabChange(item.id)}
                isActive={activeTab === item.id}
                className="w-full justify-start text-white hover:bg-gray-800"
              >
                <item.icon className="h-4 w-4 mr-2" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-gray-400">{item.description}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          {/* Termos de Uso */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTermosModalOpen(true)}
              className="w-full justify-start text-white hover:bg-gray-800 border border-red-500/30 bg-red-900/10"
            >
              <FileCheck className="h-4 w-4 mr-2 text-red-400" />
              <div className="flex flex-col items-start">
                <span className="font-medium text-red-300">Termos de Uso</span>
                <span className="text-xs text-red-400">IMPORTANTE - Clique aqui</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* WhatsApp Suporte */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="https://wa.me/5511940747924" target="_blank" rel="noopener noreferrer" className="w-full justify-start text-white hover:bg-gray-800">
                <MessageCircle className="h-4 w-4 mr-2" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Precisa de ajuda?</span>
                  <span className="text-xs text-gray-400">Fale conosco no WhatsApp</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Sair do Sistema */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full justify-start text-white hover:bg-red-800 bg-red-900/20 border border-red-600/30"
            >
              <LogOut className="h-4 w-4 mr-2 text-red-400" />
              <div className="flex flex-col items-start">
                <span className="font-medium text-red-300">
                  {isLoggingOut ? 'Saindo...' : 'Sair do Sistema'}
                </span>
                <span className="text-xs text-red-400">Logout da conta</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
