
import { useCallback } from 'react'
import { useOptimizedClientesQuery, useOptimizedClienteMutations } from './useOptimizedReactQuery'
import { useOptimizedMetricsQuery } from './useOptimizedMetricsQuery'

interface UseUltraOptimizedManagerDataProps {
  userEmail: string
  isAdminUser?: boolean
  selectedManager?: string
  filterType?: 'sites-pendentes' | 'sites-finalizados'
}

export function useUltraOptimizedManagerData({
  userEmail,
  isAdminUser = false,
  selectedManager,
  filterType
}: UseUltraOptimizedManagerDataProps) {
  console.log('🚀 [useUltraOptimizedManagerData] === ETAPA 4: REACT QUERY ULTRA-OTIMIZADO ===')
  console.log('⚡ [useUltraOptimizedManagerData] Cache inteligente + Optimistic updates')

  // HOOK PRINCIPAL: Query otimizada com cache
  const {
    clientes,
    isLoading: clientesLoading,
    error,
    refetch,
    isFetching,
    isStale
  } = useOptimizedClientesQuery({
    userEmail,
    isAdminUser,
    selectedManager,
    filterType
  })

  // HOOK DE MÉTRICAS: Cache separado para performance
  const {
    metrics,
    filteredClientes,
    isLoading: metricsLoading
  } = useOptimizedMetricsQuery(clientes, userEmail, selectedManager)

  // HOOK DE MUTATIONS: Com optimistic updates
  const {
    updateCliente,
    addCliente,
    isUpdating,
    isAdding
  } = useOptimizedClienteMutations(userEmail, selectedManager)

  // CALLBACK OTIMIZADO: Refetch que respeita cache
  const optimizedRefetch = useCallback(() => {
    console.log('🔄 [useUltraOptimizedManagerData] Refetch com cache strategy')
    return refetch()
  }, [refetch])

  console.log('📊 [useUltraOptimizedManagerData] Status React Query:', {
    clientesCount: clientes.length,
    loading: clientesLoading,
    fetching: isFetching,
    stale: isStale,
    updating: isUpdating,
    adding: isAdding,
    cacheStatus: isStale ? 'CACHE STALE' : 'CACHE FRESH'
  })

  return {
    // Dados principais
    clientes,
    loading: clientesLoading || metricsLoading,
    error,
    currentManager: selectedManager || null,

    // Métricas otimizadas
    metrics,
    filteredClientes,

    // Operações otimizadas
    refetch: optimizedRefetch,
    updateCliente,
    addCliente,

    // Status de loading granular
    isFetching,
    isStale,
    isUpdating,
    isAdding
  }
}
