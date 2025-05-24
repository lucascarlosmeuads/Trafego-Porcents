
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
        // Lista fixa dos gerentes com base nas novas tabelas
        const availableManagers = ['Andreza', 'Lucas Falcão']
        
        // Verificar se as tabelas existem no Supabase
        const verifiedManagers: string[] = []
        
        for (const manager of availableManagers) {
          const tableName = manager === 'Lucas Falcão' ? 'clientes_lucas_falcao' : 'clientes_andreza'
          
          try {
            const { error } = await supabase
              .from(tableName)
              .select('id')
              .limit(1)
            
            if (!error) {
              verifiedManagers.push(manager)
              console.log(`Tabela ${tableName} verificada com sucesso`)
            } else {
              console.warn(`Tabela ${tableName} não encontrada:`, error)
            }
          } catch (err) {
            console.warn(`Erro ao verificar tabela ${tableName}:`, err)
          }
        }
        
        setManagers(verifiedManagers.length > 0 ? verifiedManagers : availableManagers)
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
            Gerentes
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
