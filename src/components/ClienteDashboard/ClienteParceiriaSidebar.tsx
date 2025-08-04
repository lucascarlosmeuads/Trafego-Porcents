import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter
} from '@/components/ui/sidebar'
import { 
  Home, 
  User, 
  Building2, 
  Calculator,
  Target,
  Activity,
  LogOut,
  Loader2,
  Handshake
} from 'lucide-react'

interface ClienteParceiriaSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ClienteParceiriaSidebar({ activeTab, onTabChange }: ClienteParceiriaSidebarProps) {
  const { signOut, currentManagerName } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Fallback: forçar redirecionamento
      window.location.href = '/'
    }
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Visão geral dos dados'
    },
    {
      id: 'perfil',
      label: 'Meu Perfil',
      icon: User,
      description: 'Dados pessoais e contato'
    },
    {
      id: 'negocio',
      label: 'Meu Negócio',
      icon: Building2,
      description: 'Produto e informações'
    },
    {
      id: 'orcamento',
      label: 'Orçamento',
      icon: Calculator,
      description: 'Custos personalizados'
    },
    {
      id: 'planejamento',
      label: 'Planejamento',
      icon: Target,
      description: 'Estratégia e próximos passos'
    },
    {
      id: 'status',
      label: 'Status',
      icon: Activity,
      description: 'Acompanhar projeto'
    }
  ]

  return (
    <Sidebar className="w-64 border-r">
      <SidebarHeader className="border-b p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Handshake className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Parceria Tráfego</h2>
              <p className="text-xs text-muted-foreground">Portal do Cliente Lead</p>
            </div>
          </div>
          {currentManagerName && (
            <div className="text-xs text-muted-foreground">
              Vendedor: {currentManagerName}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onTabChange(item.id)}
                isActive={activeTab === item.id}
                className="w-full justify-start"
              >
                <item.icon className="w-4 h-4" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 text-sm mb-2">💡 Dica</h3>
          <div className="space-y-1 text-xs text-blue-700">
            <div>• Complete o formulário para ver seu planejamento</div>
            <div>• Mantenha os dados atualizados</div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button
          onClick={handleSignOut}
          disabled={loggingOut}
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          {loggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span className="ml-2">Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}