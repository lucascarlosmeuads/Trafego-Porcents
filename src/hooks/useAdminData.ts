
import { useState, useEffect, useCallback } from 'react'
import { supabase, Cliente } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface UseAdminDataOptions {
  pageSize?: number
  selectedManager?: string | null
  searchTerm?: string
  statusFilter?: string
  siteStatusFilter?: string
}

interface UseAdminDataResult {
  clientes: Cliente[]
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  totalPages: number
  nextPage: () => void
  prevPage: () => void
  setPage: (page: number) => void
  refetch: () => void
  metrics: {
    totalClients: number
    activeClients: number
    inactiveClients: number
    problemClients: number
  }
}

export function useAdminData(options: UseAdminDataOptions = {}): UseAdminDataResult {
  const {
    pageSize = 50,
    selectedManager,
    searchTerm = '',
    statusFilter = 'all',
    siteStatusFilter = 'all'
  } = options

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    problemClients: 0
  })
  const { toast } = useToast()

  // Calcular offset para paginação
  const offset = (currentPage - 1) * pageSize
  const totalPages = Math.ceil(totalCount / pageSize)

  const fetchMetrics = useCallback(async () => {
    try {
      console.log('📊 [useAdminData] Buscando métricas...')
      
      let baseQuery = supabase
        .from('todos_clientes')
        .select('status_campanha', { count: 'exact' })

      // Aplicar filtro de gestor se selecionado
      if (selectedManager && 
          selectedManager !== 'Todos os Clientes' && 
          selectedManager !== 'Todos os Gestores' && 
          selectedManager !== null &&
          selectedManager !== '') {
        baseQuery = baseQuery.eq('email_gestor', selectedManager)
      }

      const { data, error, count } = await baseQuery

      if (error) {
        console.error('❌ [useAdminData] Erro ao buscar métricas:', error)
        return
      }

      const statusInativos = [
        'Cliente Sumiu', 'Reembolso', 'Cancelado', 'Cancelamento',
        'Inativo', 'Off', 'Pausado', 'Parado', 'Finalizado', 'Encerrado'
      ]

      const activeClients = data?.filter(c => !statusInativos.includes(c.status_campanha || '')).length || 0
      const inactiveClients = data?.filter(c => statusInativos.includes(c.status_campanha || '')).length || 0
      const problemClients = data?.filter(c => c.status_campanha === 'Problema').length || 0

      setMetrics({
        totalClients: count || 0,
        activeClients,
        inactiveClients,
        problemClients
      })

      console.log('✅ [useAdminData] Métricas carregadas:', {
        total: count,
        active: activeClients,
        inactive: inactiveClients,
        problems: problemClients
      })
    } catch (err) {
      console.error('💥 [useAdminData] Erro ao carregar métricas:', err)
    }
  }, [selectedManager])

  const fetchData = useCallback(async () => {
    if (currentPage === 1) {
      setLoading(true)
    }
    setError(null)

    try {
      console.log('🔍 [useAdminData] === INICIANDO BUSCA PAGINADA ===')
      console.log('📧 [useAdminData] selectedManager:', selectedManager)
      console.log('📄 [useAdminData] Página:', currentPage, 'Tamanho:', pageSize)
      console.log('🔍 [useAdminData] Filtros:', { searchTerm, statusFilter, siteStatusFilter })

      // Construir query base
      let query = supabase
        .from('todos_clientes')
        .select('*', { count: 'exact' })

      // Aplicar filtro de gestor
      if (selectedManager && 
          selectedManager !== 'Todos os Clientes' && 
          selectedManager !== 'Todos os Gestores' && 
          selectedManager !== null &&
          selectedManager !== '') {
        console.log('🎯 [useAdminData] Filtrando por gestor:', selectedManager)
        query = query.eq('email_gestor', selectedManager)
      }

      // Aplicar filtros de busca
      if (searchTerm) {
        query = query.or(`nome_cliente.ilike.%${searchTerm}%,email_cliente.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%,vendedor.ilike.%${searchTerm}%`)
      }

      // Aplicar filtro de status
      if (statusFilter !== 'all') {
        query = query.eq('status_campanha', statusFilter)
      }

      // Aplicar filtro de site status
      if (siteStatusFilter !== 'all') {
        query = query.eq('site_status', siteStatusFilter)
      }

      // Aplicar paginação e ordenação
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (error) {
        console.error('❌ [useAdminData] Erro ao buscar dados:', error)
        throw error
      }

      console.log('✅ [useAdminData] Dados encontrados:', data?.length || 0, 'registros')
      console.log('📊 [useAdminData] Total no banco:', count)
      
      // Formatar dados
      const formattedClientes = (data || []).map(cliente => ({
        ...cliente,
        data_venda: cliente.data_venda ? String(cliente.data_venda) : null,
        created_at: cliente.created_at ? String(cliente.created_at) : null,
        status_campanha: cliente.status_campanha ? String(cliente.status_campanha) : ''
      }))
      
      setClientes(formattedClientes)
      setTotalCount(count || 0)

    } catch (err: any) {
      console.error('💥 [useAdminData] Erro na busca:', err)
      setError(err.message || 'Erro desconhecido')
      toast({
        title: "Erro",
        description: `Erro ao carregar dados: ${err.message}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [selectedManager, currentPage, pageSize, searchTerm, statusFilter, siteStatusFilter, offset, toast])

  // Carregar métricas uma vez
  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  // Carregar dados quando filtros mudam
  useEffect(() => {
    // Reset para primeira página quando filtros mudam
    if (currentPage !== 1) {
      setCurrentPage(1)
      return
    }
    fetchData()
  }, [selectedManager, searchTerm, statusFilter, siteStatusFilter])

  // Carregar dados quando página muda
  useEffect(() => {
    fetchData()
  }, [currentPage])

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const refetch = () => {
    fetchData()
    fetchMetrics()
  }

  return {
    clientes,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    setPage,
    refetch,
    metrics
  }
}
