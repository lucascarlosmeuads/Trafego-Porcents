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
  UserPlus, 
  Users, 
  LogOut,
  Loader2,
  Star
} from 'lucide-react'

interface ClienteNovoSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ClienteNovoSidebar({ activeTab, onTabChange }: ClienteNovoSidebarProps) {
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
      description: 'Visão geral e métricas'
    },
    {
      id: 'adicionar-cliente',
      label: 'Adicionar Cliente',
      icon: UserPlus,
      description: 'Criar novos cadastros'
    },
    {
      id: 'clientes',
      label: 'Lista de Clientes',
      icon: Users,
      description: 'Ver clientes criados'
    }
  ]

  return (
    <Sidebar className="w-64 border-r">
      <SidebarHeader className="border-b p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Cliente Novo</h2>
              <p className="text-xs text-muted-foreground">Sistema de Comissões Fixas</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {currentManagerName}
          </div>
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

        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 text-sm mb-2">Comissões Fixas</h3>
          <div className="space-y-1 text-xs text-yellow-700">
            <div>• Venda R$ 500 → R$ 150</div>
            <div>• Venda R$ 350 → R$ 80</div>
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