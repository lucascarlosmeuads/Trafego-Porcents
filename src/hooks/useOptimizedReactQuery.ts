
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { supabase, Cliente } from '@/lib/supabase'

// QUERY KEYS CENTRALIZADOS para melhor cache management
export const QUERY_KEYS = {
  clientes: (userEmail: string, selectedManager?: string) => 
    ['clientes', userEmail, selectedManager || 'all'] as const,
  gestores: () => ['gestores'] as const,
  briefings: (clienteId: string) => ['briefings', clienteId] as const,
  vendas: (clienteId: string) => ['vendas', clienteId] as const,
  arquivos: (clienteId: string) => ['arquivos', clienteId] as const,
  metrics: (userEmail: string, selectedManager?: string) => 
    ['metrics', userEmail, selectedManager || 'all'] as const,
} as const

interface UseOptimizedClientesQueryProps {
  userEmail: string
  isAdminUser?: boolean
  selectedManager?: string
  filterType?: 'sites-pendentes' | 'sites-finalizados'
  enabled?: boolean
}

export function useOptimizedClientesQuery({
  userEmail,
  isAdminUser = false,
  selectedManager,
  filterType,
  enabled = true
}: UseOptimizedClientesQueryProps) {
  console.log('⚡ [useOptimizedClientesQuery] React Query otimizado iniciado')

  // QUERY OTIMIZADA: Cache inteligente com stale time
  const {
    data: clientes = [],
    isLoading,
    error,
    refetch,
    isFetching,
    isStale
  } = useQuery({
    queryKey: QUERY_KEYS.clientes(userEmail, selectedManager),
    queryFn: async (): Promise<Cliente[]> => {
      console.log('🔄 [useOptimizedClientesQuery] Executando query otimizada')
      const startTime = performance.now()

      if (!userEmail) {
        throw new Error('UserEmail é obrigatório')
      }

      let query = supabase
        .from('todos_clientes')
        .select('*, site_pago')

      // Aplicar filtros de acordo com a lógica existente
      if (filterType === 'sites-pendentes') {
        query = query.eq('site_status', 'aguardando_link')
      } else if (filterType === 'sites-finalizados') {
        query = query.eq('site_status', 'finalizado')
      } else if (isAdminUser) {
        if (selectedManager && 
            selectedManager !== 'Todos os Clientes' && 
            selectedManager !== 'Todos os Gestores' && 
            selectedManager !== null &&
            selectedManager !== '') {
          query = query.eq('email_gestor', selectedManager)
        }
      } else {
        query = query.eq('email_gestor', userEmail)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useOptimizedClientesQuery] Erro na query:', error)
        throw error
      }

      const endTime = performance.now()
      console.log(`⚡ [useOptimizedClientesQuery] Query executada em ${(endTime - startTime).toFixed(2)}ms`)
      console.log('📊 [useOptimizedClientesQuery] Dados carregados:', data?.length || 0, 'registros')

      return data || []
    },
    enabled: enabled && !!userEmail,
    staleTime: 30 * 1000, // 30 segundos - dados ficam "fresh"
    gcTime: 5 * 60 * 1000, // 5 minutos no cache
    refetchOnWindowFocus: false, // Evita refetch desnecessário
    refetchOnMount: false, // Usa cache se disponível
    retry: 2, // Retry limitado
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  console.log('📊 [useOptimizedClientesQuery] Status da query:', {
    isLoading,
    isFetching,
    isStale,
    clientesCount: clientes.length,
    cacheStatus: isStale ? 'STALE' : 'FRESH'
  })

  return {
    clientes,
    isLoading,
    error,
    refetch,
    isFetching,
    isStale
  }
}

// HOOK OTIMIZADO: Mutations com invalidação inteligente
export function useOptimizedClienteMutations(userEmail: string, selectedManager?: string) {
  const queryClient = useQueryClient()

  console.log('🔧 [useOptimizedClienteMutations] Mutations otimizadas inicializadas')

  // CALLBACK: Invalidação inteligente de cache
  const invalidateClientesQueries = useCallback(() => {
    console.log('🔄 [useOptimizedClienteMutations] Invalidando queries relacionadas')
    
    // Invalidar queries específicas, não tudo
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.clientes(userEmail, selectedManager)
    })
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.metrics(userEmail, selectedManager)
    })
  }, [queryClient, userEmail, selectedManager])

  // MUTATION: Update cliente otimizado
  const updateClienteMutation = useMutation({
    mutationFn: async ({ id, field, value }: { 
      id: string
      field: string
      value: string | boolean | number 
    }) => {
      console.log('📝 [useOptimizedClienteMutations] Update mutation:', { id, field, value })
      
      const { data, error } = await supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ [useOptimizedClienteMutations] Erro no update:', error)
        throw error
      }

      return data
    },
    onSuccess: (data, variables) => {
      console.log('✅ [useOptimizedClienteMutations] Update bem-sucedido')
      
      // OPTIMISTIC UPDATE: Atualizar cache instantaneamente
      queryClient.setQueryData(
        QUERY_KEYS.clientes(userEmail, selectedManager),
        (oldData: Cliente[] | undefined) => {
          if (!oldData) return oldData
          
          return oldData.map(cliente => 
            cliente.id === variables.id 
              ? { ...cliente, [variables.field]: variables.value }
              : cliente
          )
        }
      )
      
      // Invalidar métricas para recalculo
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.metrics(userEmail, selectedManager)
      })
    },
    onError: (error) => {
      console.error('❌ [useOptimizedClienteMutations] Erro na mutation:', error)
      // Em caso de erro, invalidar para buscar dados atuais
      invalidateClientesQueries()
    }
  })

  // MUTATION: Add cliente otimizado
  const addClienteMutation = useMutation({
    mutationFn: async (clienteData: any) => {
      console.log('➕ [useOptimizedClienteMutations] Add mutation')
      
      const { data, error } = await supabase
        .from('todos_clientes')
        .insert(clienteData)
        .select()
        .single()

      if (error) {
        console.error('❌ [useOptimizedClienteMutations] Erro no add:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      console.log('✅ [useOptimizedClienteMutations] Add bem-sucedido')
      invalidateClientesQueries()
    },
    onError: (error) => {
      console.error('❌ [useOptimizedClienteMutations] Erro na add mutation:', error)
    }
  })

  return {
    updateCliente: updateClienteMutation.mutate,
    addCliente: addClienteMutation.mutate,
    isUpdating: updateClienteMutation.isPending,
    isAdding: addClienteMutation.isPending
  }
}

// HOOK OTIMIZADO: Prefetch estratégico
export function useOptimizedPrefetch() {
  const queryClient = useQueryClient()

  const prefetchClientesForManager = useCallback(async (userEmail: string, selectedManager?: string) => {
    console.log('🚀 [useOptimizedPrefetch] Prefetch para gestor:', selectedManager)
    
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.clientes(userEmail, selectedManager),
      queryFn: async () => {
        // Mesma lógica da query, mas simplificada para prefetch
        let query = supabase.from('todos_clientes').select('*, site_pago')
        
        if (selectedManager && selectedManager !== 'Todos os Gestores') {
          query = query.eq('email_gestor', selectedManager)
        }
        
        const { data } = await query.order('created_at', { ascending: false })
        return data || []
      },
      staleTime: 30 * 1000
    })
  }, [queryClient])

  return {
    prefetchClientesForManager
  }
}
