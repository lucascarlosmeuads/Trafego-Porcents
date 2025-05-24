
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

interface GestorInfo {
  nome: string
  email: string
  total_clientes: number
}

interface ManagerSidebarProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
}

export function ManagerSidebar({ selectedManager, onManagerSelect }: ManagerSidebarProps) {
  const [gestores, setGestores] = useState<GestorInfo[]>([])
  const [totalClientes, setTotalClientes] = useState(0)
  const [loading, setLoading] = useState(true)

  const buscarGestores = async () => {
    try {
      console.log('🔍 [ManagerSidebar] Buscando gestores e contagens...')
      
      // Buscar contagem total de clientes
      const { count: totalCount } = await supabase
        .from('todos_clientes')
        .select('*', { count: 'exact', head: true })

      setTotalClientes(totalCount || 0)

      // Buscar gestores ativos
      const { data: gestoresData, error: gestoresError } = await supabase
        .from('gestores')
        .select('nome, email')
        .eq('ativo', true)
        .order('nome')

      if (gestoresError) {
        console.error('❌ [ManagerSidebar] Erro ao buscar gestores:', gestoresError)
        return
      }

      // Para cada gestor, contar seus clientes
      const gestoresComContagem = await Promise.all(
        (gestoresData || []).map(async (gestor) => {
          const { count } = await supabase
            .from('todos_clientes')
            .select('*', { count: 'exact', head: true })
            .eq('email_gestor', gestor.email)

          return {
            ...gestor,
            total_clientes: count || 0
          }
        })
      )

      console.log('✅ [ManagerSidebar] Gestores carregados:', gestoresComContagem.length)
      console.log('📊 [ManagerSidebar] Total de clientes:', totalCount)
      
      setGestores(gestoresComContagem)
    } catch (error) {
      console.error('💥 [ManagerSidebar] Erro na busca:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    buscarGestores()
    
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
          buscarGestores()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <Sidebar variant="sidebar" className="w-72 border-r bg-card">
        <SidebarHeader className="border-b p-6">
          <h2 className="text-lg font-semibold text-foreground">Carregando...</h2>
        </SidebarHeader>
      </Sidebar>
    )
  }

  return (
    <Sidebar variant="sidebar" className="w-72 border-r bg-card">
      <SidebarHeader className="border-b p-6">
        <h2 className="text-lg font-semibold text-foreground">Painel Administrativo</h2>
        <p className="text-sm text-muted-foreground">Gestão de clientes por responsável</p>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium mb-3">
            Gestores ({gestores.length})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onManagerSelect(null)}
                  isActive={selectedManager === null}
                  className="w-full justify-between h-10 px-3 rounded-md hover:bg-accent/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="font-medium truncate">Todos os Clientes</span>
                  </div>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0 w-8 h-6 text-center justify-center text-xs">
                    {totalClientes}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {gestores.map((gestor) => (
                <SidebarMenuItem key={gestor.nome}>
                  <SidebarMenuButton
                    onClick={() => onManagerSelect(gestor.nome)}
                    isActive={selectedManager === gestor.nome}
                    className="w-full justify-between h-10 px-3 rounded-md hover:bg-accent/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <User className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium truncate">{gestor.nome}</span>
                    </div>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0 w-8 h-6 text-center justify-center text-xs">
                      {gestor.total_clientes}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
