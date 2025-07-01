
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

  const fetchData = useCallback(async () => {
    if (!userEmail) {
      console.warn('⚠️ [useManagerData] userEmail não fornecido')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 [useManagerData] === INICIANDO BUSCA COMPLETA ===')
      console.log('📧 [useManagerData] userEmail:', userEmail)
      console.log('🔒 [useManagerData] isAdminUser:', isAdminUser)
      console.log('👤 [useManagerData] selectedManager:', selectedManager)
      console.log('🎯 [useManagerData] filterType:', filterType)

      // Primeiro, contar o total de registros para verificação
      let countQuery = supabase
        .from('todos_clientes')
        .select('*', { count: 'exact', head: true })

      // Aplicar filtros à contagem também
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
        console.log(`📊 [useManagerData] Total de registros esperados: ${count}`)
      }

      // Agora buscar todos os dados com limite expandido
      let query = supabase
        .from('todos_clientes')
        .select('*, site_pago')
        .range(0, 15000) // Aumentar limite significativamente para garantir todos os registros

      // PRIORITY 1: Handle Site Creator panel filters first
      if (filterType === 'sites-pendentes') {
        console.log('🌐 [useManagerData] Site Creator: Aplicando filtro para sites pendentes (aguardando_link)')
        query = query.eq('site_status', 'aguardando_link')
      } else if (filterType === 'sites-finalizados') {
        console.log('✅ [useManagerData] Site Creator: Aplicando filtro para sites finalizados')
        query = query.eq('site_status', 'finalizado')
      } else {
        // PRIORITY 2: Handle Admin panel logic
        console.log('📊 [useManagerData] Admin/Gestor panel mode')
        
        if (isAdminUser) {
          // Admin user logic - CORREÇÃO PRINCIPAL
          if (selectedManager && 
              selectedManager !== 'Todos os Clientes' && 
              selectedManager !== 'Todos os Gestores' && 
              selectedManager !== null &&
              selectedManager !== '') {
            console.log('🔍 [useManagerData] Admin filtrando por gestor específico:', selectedManager)
            query = query.eq('email_gestor', selectedManager)
          } else {
            console.log('👑 [useManagerData] Admin buscando TODOS os clientes (sem filtro de gestor)')
            // Para admin com "Todos os Gestores" ou null/vazio, NÃO aplicar filtro de email_gestor
            // Isso permite que o admin veja TODOS os clientes de TODOS os gestores
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
      
      // Verificar se há discrepância entre contagem esperada e carregada
      if (count && data && data.length < count) {
        console.warn(`⚠️ [useManagerData] DISCREPÂNCIA: Esperado ${count}, carregado ${data.length}`)
        
        // Para casos críticos, tentar uma segunda busca sem range
        if (data.length < count * 0.9) { // Se carregou menos de 90% do esperado
          console.log('🔄 [useManagerData] Tentando busca sem limite de range...')
          
          let unlimitedQuery = supabase
            .from('todos_clientes')
            .select('*, site_pago')
          
          // Aplicar os mesmos filtros
          if (filterType === 'sites-pendentes') {
            unlimitedQuery = unlimitedQuery.eq('site_status', 'aguardando_link')
          } else if (filterType === 'sites-finalizados') {
            unlimitedQuery = unlimitedQuery.eq('site_status', 'finalizado')
          } else if (isAdminUser) {
            if (selectedManager && 
                selectedManager !== 'Todos os Clientes' && 
                selectedManager !== 'Todos os Gestores' && 
                selectedManager !== null &&
                selectedManager !== '') {
              unlimitedQuery = unlimitedQuery.eq('email_gestor', selectedManager)
            }
          } else {
            unlimitedQuery = unlimitedQuery.eq('email_gestor', userEmail)
          }

          const { data: unlimitedData, error: unlimitedError } = await unlimitedQuery.order('created_at', { ascending: false })
          
          if (!unlimitedError && unlimitedData && unlimitedData.length > data.length) {
            console.log(`🔄 [useManagerData] Busca sem limite retornou mais dados: ${unlimitedData.length}`)
            setClientes(unlimitedData || [])
            return
          }
        }
      }
      
      // Enhanced logging for verification
      if (data && data.length > 0) {
        if (filterType === 'sites-pendentes') {
          console.log('🌐 [useManagerData] Sites pendentes (aguardando_link):', data.length)
          console.log('📋 [useManagerData] Amostra de sites pendentes:', data.slice(0, 3).map(c => ({
            id: c.id,
            nome: c.nome_cliente,
            site_status: c.site_status,
            email_gestor: c.email_gestor
          })))
        } else if (filterType === 'sites-finalizados') {
          console.log('✅ [useManagerData] Sites finalizados:', data.length)
          console.log('📋 [useManagerData] Amostra de sites finalizados:', data.slice(0, 3).map(c => ({
            id: c.id,
            nome: c.nome_cliente,
            site_status: c.site_status,
            email_gestor: c.email_gestor
          })))
        } else if (isAdminUser && (!selectedManager || selectedManager === 'Todos os Gestores' || selectedManager === 'Todos os Clientes' || selectedManager === '')) {
          console.log('👑 [useManagerData] Admin - TODOS os clientes:', data.length)
          console.log('📊 [useManagerData] Distribuição por site_status:', {
            pendente: data.filter(c => c.site_status === 'pendente').length,
            aguardando_link: data.filter(c => c.site_status === 'aguardando_link').length,
            finalizado: data.filter(c => c.site_status === 'finalizado').length,
            outros: data.filter(c => !['pendente', 'aguardando_link', 'finalizado'].includes(c.site_status)).length
          })
          console.log('📊 [useManagerData] Amostra de clientes (todos os gestores):', data.slice(0, 5).map(c => ({
            id: c.id,
            nome: c.nome_cliente,
            email_gestor: c.email_gestor,
            status_campanha: c.status_campanha,
            comissao: c.comissao
          })))
        } else if (isAdminUser && selectedManager) {
          console.log('🎯 [useManagerData] Admin - Clientes do gestor específico:', selectedManager, ':', data.length)
        }
      }
      
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
    setClientes,
  }
}
