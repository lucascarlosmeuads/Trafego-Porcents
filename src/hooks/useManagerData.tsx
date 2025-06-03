
import { useState, useEffect, useCallback } from 'react'
import { supabase, Cliente } from '@/lib/supabase'

interface UseManagerDataResult {
  clientes: Cliente[]
  loading: boolean
  error: string | null
  refetch: () => void
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
      console.log('🔍 [useManagerData] === INICIANDO BUSCA ===')
      console.log('📧 [useManagerData] userEmail:', userEmail)
      console.log('🔒 [useManagerData] isAdminUser:', isAdminUser)
      console.log('👤 [useManagerData] selectedManager:', selectedManager)
      console.log('🎯 [useManagerData] filterType:', filterType)

      let query = supabase
        .from('todos_clientes')
        .select('*, site_pago')

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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    clientes,
    loading,
    error,
    refetch: fetchData,
    currentManager: selectedManager || null,
    setClientes,
  }
}
