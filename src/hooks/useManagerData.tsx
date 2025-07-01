
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
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>
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

  // Função para buscar dados em chunks para evitar limitações
  const fetchAllDataInChunks = async (baseQuery: any, chunkSize: number = 1000) => {
    const allData: Cliente[] = []
    let from = 0
    let hasMore = true

    while (hasMore) {
      console.log(`🔄 [useManagerData] Buscando chunk ${from} a ${from + chunkSize - 1}`)
      
      const { data, error } = await baseQuery
        .range(from, from + chunkSize - 1)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(`❌ [useManagerData] Erro no chunk ${from}:`, error)
        throw error
      }

      if (data && data.length > 0) {
        allData.push(...data)
        console.log(`✅ [useManagerData] Chunk ${from}: ${data.length} registros`)
        
        // Se retornou menos que o chunk size, não há mais dados
        if (data.length < chunkSize) {
          hasMore = false
        } else {
          from += chunkSize
        }
      } else {
        hasMore = false
      }
    }

    console.log(`🎯 [useManagerData] Total de registros carregados: ${allData.length}`)
    return allData
  }

  const fetchData = useCallback(async () => {
    if (!userEmail) {
      console.warn('⚠️ [useManagerData] userEmail não fornecido')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 [useManagerData] === INICIANDO BUSCA COMPLETA SEM LIMITAÇÃO ===')
      console.log('📧 [useManagerData] userEmail:', userEmail)
      console.log('🔒 [useManagerData] isAdminUser:', isAdminUser)
      console.log('👤 [useManagerData] selectedManager:', selectedManager)
      console.log('🎯 [useManagerData] filterType:', filterType)

      // Primeiro, contar o total de registros para verificação
      let countQuery = supabase
        .from('todos_clientes')
        .select('*', { count: 'exact', head: true })

      // Aplicar filtros à contagem
      if (filterType === 'sites-pendentes') {
        countQuery = countQuery.eq('site_status', 'aguardando_link')
      } else if (filterType === 'sites-finalizados') {
        countQuery = countQuery.eq('site_status', 'finalizado')
      } else if (isAdminUser) {
        if (selectedManager && 
            selectedManager !== 'Todos os Clientes' && 
            selectedManager !== 'Todos os Gestores' && 
            selectedManager !== null &&
            selectedManager !== '') {
          countQuery = countQuery.eq('email_gestor', selectedManager)
        }
      } else {
        countQuery = countQuery.eq('email_gestor', userEmail)
      }

      const { count, error: countError } = await countQuery

      if (countError) {
        console.error('❌ [useManagerData] Erro ao contar registros:', countError)
      } else {
        console.log(`📊 [useManagerData] Total de registros no banco: ${count}`)
      }

      // Construir query base
      let baseQuery = supabase
        .from('todos_clientes')
        .select('*, site_pago')

      // Aplicar filtros
      if (filterType === 'sites-pendentes') {
        console.log('🌐 [useManagerData] Site Creator: Aplicando filtro para sites pendentes')
        baseQuery = baseQuery.eq('site_status', 'aguardando_link')
      } else if (filterType === 'sites-finalizados') {
        console.log('✅ [useManagerData] Site Creator: Aplicando filtro para sites finalizados')
        baseQuery = baseQuery.eq('site_status', 'finalizado')
      } else {
        console.log('📊 [useManagerData] Admin/Gestor panel mode')
        
        if (isAdminUser) {
          if (selectedManager && 
              selectedManager !== 'Todos os Clientes' && 
              selectedManager !== 'Todos os Gestores' && 
              selectedManager !== null &&
              selectedManager !== '') {
            console.log('🔍 [useManagerData] Admin filtrando por gestor específico:', selectedManager)
            baseQuery = baseQuery.eq('email_gestor', selectedManager)
          } else {
            console.log('👑 [useManagerData] Admin buscando TODOS os clientes')
          }
        } else {
          console.log('👤 [useManagerData] Gestor buscando apenas seus clientes')
          baseQuery = baseQuery.eq('email_gestor', userEmail)
        }
      }

      // Buscar todos os dados em chunks
      const allData = await fetchAllDataInChunks(baseQuery)
      
      // Verificar se há discrepância entre contagem esperada e carregada
      if (count && allData.length !== count) {
        console.warn(`⚠️ [useManagerData] DISCREPÂNCIA: Esperado ${count}, carregado ${allData.length}`)
      } else {
        console.log(`✅ [useManagerData] Dados carregados corretamente: ${allData.length} registros`)
      }
      
      // Enhanced logging for verification
      if (allData && allData.length > 0) {
        if (filterType === 'sites-pendentes') {
          console.log('🌐 [useManagerData] Sites pendentes (aguardando_link):', allData.length)
        } else if (filterType === 'sites-finalizados') {
          console.log('✅ [useManagerData] Sites finalizados:', allData.length)
        } else if (isAdminUser && (!selectedManager || selectedManager === 'Todos os Gestores' || selectedManager === 'Todos os Clientes' || selectedManager === '')) {
          console.log('👑 [useManagerData] Admin - TODOS os clientes:', allData.length)
          console.log('📊 [useManagerData] Distribuição por site_status:', {
            pendente: allData.filter(c => c.site_status === 'pendente').length,
            aguardando_link: allData.filter(c => c.site_status === 'aguardando_link').length,
            finalizado: allData.filter(c => c.site_status === 'finalizado').length,
            outros: allData.filter(c => !['pendente', 'aguardando_link', 'finalizado'].includes(c.site_status)).length
          })
        }
      }
      
      setClientes(allData || [])

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
    setClientes,
  }
}
