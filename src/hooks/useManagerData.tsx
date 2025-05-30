
import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase, Cliente } from '@/lib/supabase'
import { useClienteOperations } from '@/hooks/useClienteOperations'

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

// Cache simples com TTL de 5 minutos
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos
const cache = new Map<string, { data: Cliente[], timestamp: number }>()

// Campos essenciais para otimizar a query
const ESSENTIAL_FIELDS = [
  'id',
  'nome_cliente',
  'telefone', 
  'email_cliente',
  'email_gestor',
  'status_campanha',
  'site_status',
  'data_venda',
  'created_at',
  'comissao_paga',
  'valor_comissao',
  'saque_solicitado',
  'site_pago',
  'numero_bm',
  'link_site'
].join(', ')

export function useManagerData(
  userEmail: string, 
  isAdminUser: boolean = false,
  selectedManager?: string,
  filterType?: 'sites-pendentes' | 'sites-finalizados'
): UseManagerDataResult {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Criar chave de cache baseada nos parâmetros
  const cacheKey = useMemo(() => {
    return `${userEmail}-${isAdminUser}-${selectedManager}-${filterType}`
  }, [userEmail, isAdminUser, selectedManager, filterType])

  const fetchData = useCallback(async () => {
    if (!userEmail) {
      console.warn('⚠️ [useManagerData] userEmail não fornecido')
      return
    }

    // Verificar cache primeiro
    const cached = cache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('📋 [useManagerData] Usando dados do cache')
      setClientes(cached.data)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 [useManagerData] === INICIANDO BUSCA OTIMIZADA ===')
      console.log('📧 [useManagerData] userEmail:', userEmail)
      console.log('🔒 [useManagerData] isAdminUser:', isAdminUser)
      console.log('👤 [useManagerData] selectedManager:', selectedManager)
      console.log('🎯 [useManagerData] filterType:', filterType)

      let query = supabase
        .from('todos_clientes')
        .select(ESSENTIAL_FIELDS)

      // PRIORITY 1: Handle Site Creator panel filters first
      if (filterType === 'sites-pendentes') {
        console.log('🌐 [useManagerData] Site Creator: Aplicando filtro para sites pendentes (aguardando_link)')
        query = query.eq('site_status', 'aguardando_link')
      } else if (filterType === 'sites-finalizados') {
        console.log('✅ [useManagerData] Site Creator: Aplicando filtro para sites finalizados')
        query = query.eq('site_status', 'finalizado')
      } else {
        // PRIORITY 2: Handle Admin panel logic
        console.log('📊 [useManagerData] Admin panel mode')
        
        if (isAdminUser) {
          // Admin user logic
          if (selectedManager && 
              selectedManager !== 'Todos os Clientes' && 
              selectedManager !== 'Todos os Gestores' && 
              selectedManager !== null) {
            console.log('🔍 [useManagerData] Admin filtrando por gestor específico:', selectedManager)
            query = query.eq('email_gestor', selectedManager)
          } else {
            console.log('👑 [useManagerData] Admin buscando TODOS os clientes (sem filtro de gestor)')
            // For admin with "Todos os Gestores" or null, NO email_gestor filter is applied
          }
        } else {
          // Regular manager/gestor - only their clients
          console.log('👤 [useManagerData] Gestor buscando apenas seus clientes')
          query = query.eq('email_gestor', userEmail)
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useManagerData] Erro ao buscar dados:', error)
        throw error
      }

      console.log('✅ [useManagerData] Dados encontrados:', data?.length || 0, 'registros')
      
      // Enhanced logging for verification
      if (data && data.length > 0) {
        if (filterType === 'sites-pendentes') {
          console.log('🌐 [useManagerData] Sites pendentes (aguardando_link):', data.length)
        } else if (filterType === 'sites-finalizados') {
          console.log('✅ [useManagerData] Sites finalizados:', data.length)
        } else if (isAdminUser && (!selectedManager || selectedManager === 'Todos os Gestores' || selectedManager === 'Todos os Clientes')) {
          console.log('👑 [useManagerData] Admin - TODOS os clientes:', data.length)
        }
      }
      
      // Armazenar no cache
      cache.set(cacheKey, { data: data || [], timestamp: Date.now() })
      
      setClientes(data || [])

    } catch (err: any) {
      console.error('💥 [useManagerData] Erro na busca:', err)
      setError(err.message || 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [userEmail, isAdminUser, selectedManager, filterType, cacheKey])

  const { updateCliente, addCliente } = useClienteOperations(userEmail, isAdminUser, fetchData)

  // Função para invalidar cache quando necessário
  const invalidateCache = useCallback(() => {
    cache.delete(cacheKey)
  }, [cacheKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    clientes,
    loading,
    error,
    refetch: fetchData,
    updateCliente,
    addCliente,
    currentManager: selectedManager || null,
    setClientes,
  }
}
