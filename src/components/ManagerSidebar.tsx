
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, BarChart3, AlertTriangle, Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

interface ManagerSidebarProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ManagerSidebar({ selectedManager, onManagerSelect, activeTab, onTabChange }: ManagerSidebarProps) {
  const [problemasCount, setProblemasCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const buscarProblemasCount = async () => {
    try {
      const { count } = await supabase
        .from('todos_clientes')
        .select('*', { count: 'exact', head: true })
        .eq('status_campanha', 'Problema')

      setProblemasCount(count || 0)
    } catch (error) {
      console.error('❌ [ManagerSidebar] Erro ao buscar contagem de problemas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    buscarProblemasCount()
    
    // Configurar listener de realtime para atualizações automáticas
    const channel = supabase
      .channel('sidebar-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos_clientes'
        },
        () => {
          console.log('🔄 [ManagerSidebar] Atualizando contagens...')
          buscarProblemasCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleMenuClick = (action: string) => {
    if (action === 'dashboard') {
      onTabChange('dashboard')
      onManagerSelect(null)
    } else if (action === 'clientes') {
      onTabChange('clientes')
      // Mantém o gestor selecionado se houver um
    } else if (action === 'problemas') {
      onTabChange('problemas')
      onManagerSelect('__PROBLEMAS__')
    } else if (action === 'gestores') {
      onTabChange('clientes')
      onManagerSelect('__GESTORES__')
    }
  }

  if (loading) {
    return (
      <Sidebar variant="sidebar" className="w-64 border-r bg-card">
        <SidebarHeader className="border-b p-6">
          <h2 className="text-lg font-semibold text-foreground">Carregando...</h2>
        </SidebarHeader>
      </Sidebar>
    )
  }

  return (
    <Sidebar variant="sidebar" className="w-64 border-r bg-card">
      <SidebarHeader className="border-b p-6">
        <h2 className="text-lg font-semibold text-foreground">Painel Administrativo</h2>
        <p className="text-sm text-muted-foreground">Gestão centralizada</p>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium mb-3">
            Navegação Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleMenuClick('dashboard')}
                  isActive={activeTab === 'dashboard'}
                  className="w-full justify-start h-10 px-3 rounded-md hover:bg-accent/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <BarChart3 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">Dashboard</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleMenuClick('clientes')}
                  isActive={activeTab === 'clientes' && selectedManager !== '__GESTORES__' && selectedManager !== '__PROBLEMAS__'}
                  className="w-full justify-start h-10 px-3 rounded-md hover:bg-accent/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium">Clientes</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleMenuClick('problemas')}
                  isActive={activeTab === 'problemas' || selectedManager === '__PROBLEMAS__'}
                  className="w-full justify-between h-10 px-3 rounded-md hover:bg-accent/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="font-medium">Problemas Pendentes</span>
                  </div>
                  {problemasCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                      {problemasCount}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleMenuClick('gestores')}
                  isActive={selectedManager === '__GESTORES__'}
                  className="w-full justify-start h-10 px-3 rounded-md hover:bg-accent/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Settings className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="font-medium">Gestores</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
