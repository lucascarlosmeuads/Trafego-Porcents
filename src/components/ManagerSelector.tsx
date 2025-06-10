
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, Settings } from 'lucide-react'

interface Manager {
  email: string
  nome: string
  ativo: boolean
  clientesCount?: number
}

interface ManagerSelectorProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  showMetrics?: boolean
  isAdminContext?: boolean
}

export function ManagerSelector({ 
  selectedManager, 
  onManagerSelect, 
  showMetrics = false,
  isAdminContext = false 
}: ManagerSelectorProps) {
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)

  const ensureCarolInList = (managersList: Manager[]) => {
    const hasCarol = managersList.some(m => m.email === 'carol@trafegoporcents.com')
    
    if (!hasCarol) {
      console.log('⚠️ [ManagerSelector] Carol não encontrada, adicionando...')
      managersList.push({
        email: 'carol@trafegoporcents.com',
        nome: 'Carol',
        ativo: true,
        clientesCount: 0
      })
    }
    
    return managersList.sort((a, b) => a.nome.localeCompare(b.nome))
  }

  useEffect(() => {
    const loadManagers = async () => {
      try {
        console.log('🔍 [ManagerSelector] Carregando gestores...')
        
        const { data: gestores, error } = await supabase
          .from('gestores')
          .select('email, nome, ativo')
          .eq('ativo', true)
          .order('nome')

        if (error) {
          console.error('❌ [ManagerSelector] Erro ao carregar gestores:', error)
          throw error
        }

        console.log('🔍 [ManagerSelector] Gestores carregados:', gestores?.length)
        console.log('🔍 [ManagerSelector] Lista de gestores:', gestores)

        // Garantir que Carol está sempre na lista
        let managersWithCarol = ensureCarolInList([...(gestores || [])])

        // Se precisar mostrar métricas, buscar contagem de clientes
        if (showMetrics) {
          managersWithCarol = await Promise.all(
            managersWithCarol.map(async (gestor) => {
              try {
                const { count } = await supabase
                  .from('todos_clientes')
                  .select('*', { count: 'exact', head: true })
                  .eq('email_gestor', gestor.email)

                return {
                  ...gestor,
                  clientesCount: count || 0
                }
              } catch (error) {
                console.error('❌ [ManagerSelector] Erro ao buscar clientes para:', gestor.email, error)
                return {
                  ...gestor,
                  clientesCount: 0
                }
              }
            })
          )
        }

        console.log('✅ [ManagerSelector] Lista final de gestores:', managersWithCarol)
        setManagers(managersWithCarol)
      } catch (error) {
        console.error('❌ [ManagerSelector] Erro ao carregar gestores:', error)
        
        // Fallback com gestores essenciais
        const fallbackManagers = [
          {
            email: 'carol@trafegoporcents.com',
            nome: 'Carol',
            ativo: true,
            clientesCount: 0
          },
          {
            email: 'andreza@trafegoporcents.com',
            nome: 'Andreza',
            ativo: true,
            clientesCount: 0
          }
        ]
        
        console.log('🔄 [ManagerSelector] Usando fallback:', fallbackManagers)
        setManagers(fallbackManagers)
      } finally {
        setLoading(false)
      }
    }

    loadManagers()
  }, [showMetrics])

  const handleManagerChange = (value: string) => {
    console.log('🔍 [ManagerSelector] === SELEÇÃO DE GESTOR ===')
    console.log('🔍 [ManagerSelector] Valor selecionado:', value)
    
    if (value === 'all') {
      console.log('🔍 [ManagerSelector] Selecionando "Todos os gestores" (null)')
      onManagerSelect(null)
    } else if (value === '__GESTORES__') {
      console.log('🔍 [ManagerSelector] Selecionando "Gerenciar gestores"')
      onManagerSelect('__GESTORES__')
    } else {
      // Encontrar o gestor selecionado para confirmar o email
      const gestorSelecionado = managers.find(m => m.email === value)
      console.log('🔍 [ManagerSelector] Gestor encontrado:', gestorSelecionado)
      console.log('🔍 [ManagerSelector] Email que será passado:', value)
      onManagerSelect(value)
    }
  }

  const getDisplayValue = () => {
    if (!selectedManager) return 'all'
    if (selectedManager === '__GESTORES__') return '__GESTORES__'
    return selectedManager
  }

  const getSelectedManagerName = () => {
    if (!selectedManager) return 'Todos os gestores'
    if (selectedManager === '__GESTORES__') return 'Gerenciar gestores'
    
    const manager = managers.find(m => m.email === selectedManager)
    return manager ? manager.nome : selectedManager
  }

  const getTotalClientes = () => {
    return managers.reduce((total, manager) => total + (manager.clientesCount || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground"></div>
        <span>Carregando gestores...</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filtrar por Gestor:</span>
      </div>

      <Select value={getDisplayValue()} onValueChange={handleManagerChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um gestor">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span>{getSelectedManagerName()}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Todos os gestores</span>
              {showMetrics && (
                <Badge variant="secondary" className="ml-auto">
                  {getTotalClientes()} clientes
                </Badge>
              )}
            </div>
          </SelectItem>
          
          {managers.map((manager) => (
            <SelectItem key={manager.email} value={manager.email}>
              <div className="flex items-center gap-2 w-full">
                <UserCheck className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{manager.nome}</div>
                  <div className="text-xs text-muted-foreground">{manager.email}</div>
                </div>
                {showMetrics && (
                  <Badge variant="outline" className="ml-auto">
                    {manager.clientesCount || 0} clientes
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}

          {isAdminContext && (
            <>
              <div className="border-t my-1" />
              <SelectItem value="__GESTORES__">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Gerenciar gestores</span>
                </div>
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>

      {selectedManager && selectedManager !== '__GESTORES__' && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          {selectedManager === null 
            ? `Mostrando todos os gestores (${managers.length} ativos)`
            : `Filtrado por: ${getSelectedManagerName()}`
          }
        </div>
      )}
    </div>
  )
}
