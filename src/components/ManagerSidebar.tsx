
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
    const fetchManagerTables = async () => {
      try {
        // Buscar todas as tabelas que começam com "Clientes -"
        const { data, error } = await supabase.rpc('get_manager_tables')
        
        if (error) {
          console.error('Erro ao buscar tabelas dos gerentes:', error)
          // Fallback para gerentes conhecidos
          setManagers(['Andreza', 'Lucas Falcão'])
        } else {
          setManagers(data || ['Andreza', 'Lucas Falcão'])
        }
      } catch (err) {
        console.error('Erro:', err)
        // Fallback para gerentes conhecidos
        setManagers(['Andreza', 'Lucas Falcão'])
      } finally {
        setLoading(false)
      }
    }

    fetchManagerTables()
  }, [])

  if (loading) {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Carregando...</SidebarGroupLabel>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gerentes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managers.map((manager) => (
                <SidebarMenuItem key={manager}>
                  <SidebarMenuButton
                    onClick={() => onManagerSelect(manager)}
                    isActive={selectedManager === manager}
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>{manager}</span>
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
