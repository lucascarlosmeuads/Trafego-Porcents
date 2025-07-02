
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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

  // Lista de emails dos gestores que devem ser removidos do filtro
  const gestoresParaRemover = [
    'jose@trafegoporcents.com',
    'rullian@trafegoporcents.com',
    'carol@trafegoporcents.com',
    'junior@trafegoporcents.com',
    'lucas@trafegoporcents.com',
    'falcao@trafegoporcents.com',
    'emily@trafegoporcents.com',
    'guilherme@trafegoporcents.com'
  ]

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

        // Filtrar os gestores que devem ser removidos do filtro
        managersWithCarol = managersWithCarol.filter(gestor => 
          !gestoresParaRemover.includes(gestor.email)
        )

        console.log('🔍 [ManagerSelector] Gestores após filtro:', managersWithCarol)

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
        
        // Fallback com gestores essenciais (apenas Andreza neste caso)
        const fallbackManagers = [
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

  const getActiveTab = () => {
    if (!selectedManager) return 'all'
    if (selectedManager === '__GESTORES__') return '__GESTORES__'
    return selectedManager
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

      <Tabs value={getActiveTab()} onValueChange={handleManagerChange} className="w-full">
        <TabsList className="flex flex-wrap justify-start gap-1 h-auto p-1 bg-muted/50 overflow-x-auto">
          {/* Aba "Todos" */}
          <TabsTrigger value="all" className="flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap">
            <Users className="h-3 w-3" />
            <span>Todos</span>
            {showMetrics && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTotalClientes()}
              </Badge>
            )}
          </TabsTrigger>
          
          {/* Abas dos gestores */}
          {managers.map((manager) => (
            <TabsTrigger 
              key={manager.email} 
              value={manager.email}
              className="flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap"
            >
              <UserCheck className="h-3 w-3" />
              <span>{manager.nome}</span>
              {showMetrics && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {manager.clientesCount || 0}
                </Badge>
              )}
            </TabsTrigger>
          ))}

          {/* Aba "Gerenciar" para admins */}
          {isAdminContext && (
            <TabsTrigger value="__GESTORES__" className="flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap">
              <Settings className="h-3 w-3" />
              <span>Gerenciar</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Conteúdo das abas (invisível, só para funcionalidade) */}
        <TabsContent value="all" className="hidden"></TabsContent>
        {managers.map((manager) => (
          <TabsContent key={manager.email} value={manager.email} className="hidden"></TabsContent>
        ))}
        {isAdminContext && (
          <TabsContent value="__GESTORES__" className="hidden"></TabsContent>
        )}
      </Tabs>

      {selectedManager && selectedManager !== '__GESTORES__' && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          {selectedManager === null 
            ? `Mostrando todos os gestores (${managers.length} ativos)`
            : `Filtrado por: ${managers.find(m => m.email === selectedManager)?.nome || selectedManager}`
          }
        </div>
      )}
    </div>
  )
}
