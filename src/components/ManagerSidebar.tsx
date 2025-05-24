
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Users } from 'lucide-react'

interface ManagerSidebarProps {
  selectedManager: string
  onManagerSelect: (manager: string) => void
}

export function ManagerSidebar({ selectedManager, onManagerSelect }: ManagerSidebarProps) {
  const [managers, setManagers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchManagers()
    
    // Subscribe to real-time changes in gestores table
    const channel = supabase
      .channel('gestores-sidebar-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gestores'
        },
        (payload) => {
          console.log('🔄 Mudança detectada na tabela gestores (sidebar):', payload)
          // Refresh managers list when any change occurs
          fetchManagers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchManagers = async () => {
    try {
      console.log('🔍 [SIDEBAR] Buscando gestores ativos da tabela gestores...')
      
      // Buscar APENAS gestores ativos da tabela gestores
      const { data: gestoresData, error: gestoresError } = await supabase
        .from('gestores')
        .select('nome, email, ativo')
        .eq('ativo', true)
        .order('nome')

      if (gestoresError) {
        console.error('❌ [SIDEBAR] Erro ao buscar gestores:', gestoresError)
        setManagers([])
        return
      }

      if (gestoresData && gestoresData.length > 0) {
        const managerNames = gestoresData.map(gestor => gestor.nome).filter(Boolean)
        console.log('👥 [SIDEBAR] Gestores ativos encontrados:', managerNames)
        setManagers(managerNames)
      } else {
        console.log('⚠️ [SIDEBAR] Nenhum gestor ativo encontrado na tabela gestores')
        setManagers([])
      }
    } catch (err) {
      console.error('💥 [SIDEBAR] Erro ao buscar gestores:', err)
      setManagers([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Sidebar className="sidebar-dark border-sidebar-border">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground px-4 py-2">Carregando...</SidebarGroupLabel>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar className="sidebar-dark border-sidebar-border">
      <SidebarContent className="bg-sidebar-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground px-4 py-3 text-sm font-semibold uppercase tracking-wider">
            Gestores
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {managers.map((manager) => (
                <SidebarMenuItem key={manager}>
                  <SidebarMenuButton
                    onClick={() => onManagerSelect(manager)}
                    isActive={selectedManager === manager}
                    className={`
                      sidebar-item flex items-center gap-3 w-full px-3 py-3 rounded-md text-left transition-all duration-200
                      ${selectedManager === manager 
                        ? 'active bg-sidebar-primary text-sidebar-primary-foreground border-l-4 border-sidebar-ring shadow-sm' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    `}
                  >
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{manager}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {managers.length === 0 && (
                <SidebarMenuItem>
                  <div className="px-3 py-3 text-sidebar-foreground text-sm text-center">
                    Nenhum gestor ativo encontrado
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
