
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
    const fetchManagers = async () => {
      try {
        console.log('🔍 Buscando gestores únicos da tabela unificada...')
        
        // Buscar todos os gestores únicos da tabela unificada
        const { data, error } = await supabase
          .from('todos_clientes')
          .select('email_gestor')
          .not('email_gestor', 'is', null)

        if (error) {
          console.error('❌ Erro ao buscar gestores:', error)
          // Fallback para gestores conhecidos
          setManagers(['Andreza', 'Lucas Falcão'])
          return
        }

        if (data && data.length > 0) {
          // Extrair emails únicos e mapear para nomes de gestores
          const uniqueEmails = [...new Set(data.map(item => item.email_gestor))]
          console.log('📧 Emails únicos encontrados:', uniqueEmails)
          
          const managerNames = uniqueEmails.map(email => {
            if (email.includes('andreza')) {
              return 'Andreza'
            } else if (email.includes('lucas')) {
              return 'Lucas Falcão'
            } else {
              // Extrair nome do email se possível
              const username = email.split('@')[0]
              return username.charAt(0).toUpperCase() + username.slice(1)
            }
          }).filter(Boolean)

          // Remover duplicatas e ordenar
          const uniqueManagers = [...new Set(managerNames)].sort()
          console.log('👥 Gestores encontrados:', uniqueManagers)
          
          setManagers(uniqueManagers.length > 0 ? uniqueManagers : ['Andreza', 'Lucas Falcão'])
        } else {
          console.log('⚠️ Nenhum gestor encontrado, usando fallback')
          setManagers(['Andreza', 'Lucas Falcão'])
        }
      } catch (err) {
        console.error('💥 Erro ao buscar gestores:', err)
        // Fallback para gestores conhecidos
        setManagers(['Andreza', 'Lucas Falcão'])
      } finally {
        setLoading(false)
      }
    }

    fetchManagers()
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
