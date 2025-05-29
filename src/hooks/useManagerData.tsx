
import { useState, useEffect, useCallback } from 'react'
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
}

export function useManagerData(
  userEmail: string, 
  isAdminUser: boolean = false,
  selectedManager?: string,
  filterType?: 'sites-pendentes' | 'sites-finalizados'
): UseManagerDataResult {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!userEmail) {
      console.warn('⚠️ [useManagerData] userEmail não fornecido')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 [useManagerData] === INICIANDO BUSCA ===')
      console.log('📧 [useManagerData] userEmail:', userEmail)
      console.log('🔒 [useManagerData] isAdminUser:', isAdminUser)
      console.log('👤 [useManagerData] selectedManager:', selectedManager)
      console.log('🎯 [useManagerData] filterType:', filterType)

      let query = supabase
        .from('todos_clientes')
        .select('*')

      // Aplicar filtros específicos baseados no filterType
      if (filterType === 'sites-pendentes') {
        console.log('🌐 [useManagerData] Aplicando filtro para sites pendentes')
        query = query.eq('site_status', 'aguardando_link')
      } else if (filterType === 'sites-finalizados') {
        console.log('✅ [useManagerData] Aplicando filtro para sites finalizados')
        query = query
          .eq('site_status', 'finalizado')
          .not('link_site', 'is', null)
          .neq('link_site', '')
      } else {
        // Lógica original para outros casos
        if (isAdminUser) {
          if (selectedManager && selectedManager !== 'Todos os Clientes') {
            console.log('🔍 [useManagerData] Admin filtrando por gestor específico:', selectedManager)
            query = query.eq('email_gestor', selectedManager)
          } else {
            console.log('👑 [useManagerData] Admin buscando todos os clientes')
          }
        } else {
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
      setClientes(data || [])

    } catch (err: any) {
      console.error('💥 [useManagerData] Erro na busca:', err)
      setError(err.message || 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [userEmail, isAdminUser, selectedManager, filterType])

  const { updateCliente, addCliente } = useClienteOperations(userEmail, isAdminUser, fetchData)

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
  }
}
