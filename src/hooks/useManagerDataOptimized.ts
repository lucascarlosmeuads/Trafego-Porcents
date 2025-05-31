
import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase, Cliente } from '@/lib/supabase'
import { useClienteOperations } from '@/hooks/useClienteOperations'

// Cache simples para evitar requisições desnecessárias
const cache = new Map<string, { data: Cliente[], timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

interface UseManagerDataResult {
  clientes: Cliente[]
  loading: boolean
  error: string | null
  refetch: () => void
  updateCliente: (id: string, field: string, value: string | boolean | number) => Promise<boolean>
  addCliente: (clienteData: any) => Promise<any>
  currentManager: string | null
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>
}

export function useManagerDataOptimized(
  userEmail: string, 
  isAdminUser: boolean = false,
  selectedManager?: string,
  filterType?: 'sites-pendentes' | 'sites-finalizados'
): UseManagerDataResult {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoizar a chave do cache baseada nos parâmetros
  const cacheKey = useMemo(() => {
    return `${userEmail}-${isAdminUser}-${selectedManager || 'none'}-${filterType || 'none'}`
  }, [userEmail, isAdminUser, selectedManager, filterType])

  const fetchData = useCallback(async () => {
    if (!userEmail) {
      console.warn('⚠️ [useManagerDataOptimized] userEmail não fornecido')
      return
    }

    // Verificar cache
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('📦 [useManagerDataOptimized] Usando dados do cache')
      setClientes(cached.data)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 [useManagerDataOptimized] === INICIANDO BUSCA OTIMIZADA ===')
      console.log('📧 [useManagerDataOptimized] userEmail:', userEmail)
      console.log('🔒 [useManagerDataOptimized] isAdminUser:', isAdminUser)
      console.log('👤 [useManagerDataOptimized] selectedManager:', selectedManager)
      console.log('🎯 [useManagerDataOptimized] filterType:', filterType)

      let query = supabase
        .from('todos_clientes')
        .select('*, site_pago')

      // PRIORITY 1: Handle Site Creator panel filters first
      if (filterType === 'sites-pendentes') {
        console.log('🌐 [useManagerDataOptimized] Site Creator: Aplicando filtro para sites pendentes')
        query = query.eq('site_status', 'aguardando_link')
      } else if (filterType === 'sites-finalizados') {
        console.log('✅ [useManagerDataOptimized] Site Creator: Aplicando filtro para sites finalizados')
        query = query.eq('site_status', 'finalizado')
      } else {
        // PRIORITY 2: Handle Admin panel logic
        console.log('📊 [useManagerDataOptimized] Admin panel mode')
        
        if (isAdminUser) {
          // Admin user logic
          if (selectedManager && 
              selectedManager !== 'Todos os Clientes' && 
              selectedManager !== 'Todos os Gestores' && 
              selectedManager !== null) {
            console.log('🔍 [useManagerDataOptimized] Admin filtrando por gestor específico:', selectedManager)
            query = query.eq('email_gestor', selectedManager)
          } else {
            console.log('👑 [useManagerDataOptimized] Admin buscando TODOS os clientes')
          }
        } else {
          // Regular manager/gestor - only their clients
          console.log('👤 [useManagerDataOptimized] Gestor buscando apenas seus clientes')
          query = query.eq('email_gestor', userEmail)
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useManagerDataOptimized] Erro ao buscar dados:', error)
        throw error
      }

      console.log('✅ [useManagerDataOptimized] Dados encontrados:', data?.length || 0, 'registros')
      
      const clientesData = data || []
      
      // Armazenar no cache
      cache.set(cacheKey, { data: clientesData, timestamp: Date.now() })
      
      setClientes(clientesData)

    } catch (err: any) {
      console.error('💥 [useManagerDataOptimized] Erro na busca:', err)
      setError(err.message || 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [userEmail, isAdminUser, selectedManager, filterType, cacheKey])

  // Invalidar cache quando necessário
  const refetchWithCacheInvalidation = useCallback(() => {
    cache.delete(cacheKey)
    fetchData()
  }, [cacheKey, fetchData])

  const { updateCliente, addCliente } = useClienteOperations(userEmail, isAdminUser, refetchWithCacheInvalidation)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    clientes,
    loading,
    error,
    refetch: refetchWithCacheInvalidation,
    updateCliente,
    addCliente,
    currentManager: selectedManager || null,
    setClientes,
  }
}
