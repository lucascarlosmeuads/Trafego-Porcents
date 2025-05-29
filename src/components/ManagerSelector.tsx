
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, User, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface GestorInfo {
  nome: string
  email: string
  total_clientes: number
}

interface ManagerSelectorProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  isAdminContext?: boolean
}

export function ManagerSelector({ selectedManager, onManagerSelect, isAdminContext = true }: ManagerSelectorProps) {
  const [gestores, setGestores] = useState<GestorInfo[]>([])
  const [totalClientes, setTotalClientes] = useState(0)
  const [loading, setLoading] = useState(true)

  const buscarGestores = async () => {
    try {
      console.log('🔍 [ManagerSelector] Buscando gestores e contagens...')
      
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
        console.error('❌ [ManagerSelector] Erro ao buscar gestores:', gestoresError)
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

      console.log('✅ [ManagerSelector] Gestores carregados:', gestoresComContagem.length)
      console.log('📊 [ManagerSelector] Total de clientes:', totalCount)
      
      setGestores(gestoresComContagem)
    } catch (error) {
      console.error('💥 [ManagerSelector] Erro na busca:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    buscarGestores()
    
    // Configurar listener de realtime para atualizações automáticas
    const channel = supabase
      .channel('manager-selector-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos_clientes'
        },
        () => {
          console.log('🔄 [ManagerSelector] Atualizando contagens...')
          buscarGestores()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleManagerSelect = (managerEmail: string | null) => {
    console.log('🎯 [ManagerSelector] Selecionando gestor:', managerEmail)
    onManagerSelect(managerEmail)
  }

  const getSelectedManagerName = () => {
    if (!selectedManager) {
      return isAdminContext ? 'Todos os Gestores' : 'Todos os Clientes'
    }
    // selectedManager agora é sempre o email, então buscar o nome pelo email
    const gestor = gestores.find(g => g.email === selectedManager)
    return gestor ? gestor.nome : selectedManager
  }

  const getSelectedManagerCount = () => {
    if (!selectedManager) return totalClientes
    const gestor = gestores.find(g => g.email === selectedManager)
    return gestor ? gestor.total_clientes : totalClientes
  }

  const getAllLabel = () => {
    return isAdminContext ? 'Todos os Gestores' : 'Todos os Clientes'
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-48 bg-muted animate-pulse rounded-md"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">
          {isAdminContext ? 'Filtrar por gestor:' : 'Filtrar por cliente:'}
        </span>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between min-w-[200px] max-w-[300px]">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {selectedManager ? (
                <>
                  <User className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="truncate">{getSelectedManagerName()}</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="truncate">{getAllLabel()}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="text-xs">
                {getSelectedManagerCount()}
              </Badge>
              <ChevronDown className="w-4 h-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="min-w-[200px] max-w-[400px]">
          <DropdownMenuLabel>
            {isAdminContext ? 'Selecionar Gestor' : 'Selecionar Cliente'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => handleManagerSelect(null)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-medium">{getAllLabel()}</span>
            </div>
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              {totalClientes}
            </Badge>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {gestores.map((gestor) => (
            <DropdownMenuItem
              key={gestor.email}
              onClick={() => handleManagerSelect(gestor.email)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <User className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="font-medium truncate">{gestor.nome}</span>
              </div>
              <Badge variant="secondary" className="ml-2 flex-shrink-0">
                {gestor.total_clientes}
              </Badge>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
