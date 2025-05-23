
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
