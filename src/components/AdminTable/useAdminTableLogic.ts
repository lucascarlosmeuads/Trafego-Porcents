import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface PaginationState {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
}

interface UseAdminTableLogicProps {
  selectedManager?: string | null
  filterType?: 'sites-pendentes' | 'saques-pendentes' | string
}

export function useAdminTableLogic(props: UseAdminTableLogicProps = {}) {
  const { selectedManager, filterType } = props
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [gestores, setGestores] = useState<Array<{ email: string, nome: string }>>([])
  const [transferindoCliente, setTransferindoCliente] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 0,
    itemsPerPage: 20,
    totalItems: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchGestores()
  }, [])

  useEffect(() => {
    fetchAllClientes()
  }, [pagination.currentPage, pagination.itemsPerPage, selectedManager, filterType])

  const fetchGestores = async () => {
    try {
      const { data, error } = await supabase
        .from('gestores')
        .select('email, nome')
        .eq('ativo', true)
        .order('nome')

      if (error) {
        console.error('Erro ao buscar gestores:', error)
      } else {
        setGestores(data || [])
      }
    } catch (error) {
      console.error('Erro na consulta de gestores:', error)
    }
  }

  const fetchTotalCount = async () => {
    try {
      let query = supabase
        .from('todos_clientes')
        .select('*', { count: 'exact', head: true })

      // Aplicar filtros para contagem
      if (filterType === 'sites-pendentes') {
        query = query.eq('site_status', 'aguardando_link')
      } else if (filterType === 'saques-pendentes') {
        query = query.eq('saque_solicitado', true).eq('comissao_paga', false)
      } else if (selectedManager && selectedManager !== 'Todos os Clientes' && selectedManager !== 'Todos os Gestores') {
        query = query.eq('email_gestor', selectedManager)
      }

      const { count, error } = await query

      if (error) {
        console.error('❌ Erro ao buscar contagem:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('❌ Erro na consulta de contagem:', error)
      return 0
    }
  }

  const fetchAllClientes = async () => {
    try {
      setLoading(true)
      
      // Buscar contagem total com filtros
      const totalCount = await fetchTotalCount()
      const totalPages = Math.ceil(totalCount / pagination.itemsPerPage)
      
      // Calcular offset
      const offset = (pagination.currentPage - 1) * pagination.itemsPerPage

      let query = supabase
        .from('todos_clientes')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + pagination.itemsPerPage - 1)

      // Aplicar filtros específicos
      if (filterType === 'sites-pendentes') {
        query = query.eq('site_status', 'aguardando_link')
      } else if (filterType === 'saques-pendentes') {
        query = query.eq('saque_solicitado', true).eq('comissao_paga', false)
      } else if (selectedManager && selectedManager !== 'Todos os Clientes' && selectedManager !== 'Todos os Gestores') {
        query = query.eq('email_gestor', selectedManager)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: `Erro ao carregar dados: ${error.message}`,
          variant: "destructive"
        })
      } else {
        // Properly format the data to ensure consistent date handling
        const formattedClientes = (data || []).map(cliente => ({
          ...cliente,
          // Ensure data_venda is properly formatted as string (YYYY-MM-DD)
          data_venda: cliente.data_venda ? String(cliente.data_venda) : null,
          // Ensure created_at is properly formatted as string
          created_at: cliente.created_at ? String(cliente.created_at) : null,
          // Ensure status_campanha is a string
          status_campanha: cliente.status_campanha ? String(cliente.status_campanha) : ''
        }))
        
        setClientes(formattedClientes)
        
        // Atualizar estado de paginação
        setPagination(prev => ({
          ...prev,
          totalPages,
          totalItems: totalCount
        }))
      }
    } catch (error) {
      console.error('❌ Erro na consulta:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateField = async (id: string, field: keyof Cliente, value: string) => {
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao atualizar:', error)
        toast({
          title: "Erro",
          description: `Erro ao salvar: ${error.message}`,
          variant: "destructive"
        })
      } else {
        setClientes(prev => prev.map(cliente => 
          cliente.id === id ? { ...cliente, [field]: value } : cliente
        ))
        toast({
          title: "Sucesso",
          description: "Campo atualizado com sucesso"
        })
      }
    } catch (error) {
      console.error('❌ Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar",
        variant: "destructive"
      })
    }
  }

  const handleTransferirCliente = async (clienteId: string, novoEmailGestor: string) => {
    setTransferindoCliente(clienteId)
    
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ email_gestor: novoEmailGestor })
        .eq('id', clienteId)

      if (error) {
        console.error('❌ Erro ao transferir cliente:', error)
        toast({
          title: "Erro",
          description: `Erro ao transferir cliente: ${error.message}`,
          variant: "destructive"
        })
      } else {
        setClientes(prev => prev.map(cliente => 
          cliente.id === clienteId ? { ...cliente, email_gestor: novoEmailGestor } : cliente
        ))
        toast({
          title: "Sucesso",
          description: "Cliente transferido com sucesso"
        })
      }
    } catch (error) {
      console.error('❌ Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao transferir cliente",
        variant: "destructive"
      })
    } finally {
      setTransferindoCliente(null)
    }
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    updateField(id, 'status_campanha', newStatus)
  }

  // Funções de paginação
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }))
    }
  }

  const nextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      goToPage(pagination.currentPage + 1)
    }
  }

  const prevPage = () => {
    if (pagination.currentPage > 1) {
      goToPage(pagination.currentPage - 1)
    }
  }

  const changeItemsPerPage = (newItemsPerPage: number) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1 // Voltar para primeira página
    }))
  }

  return {
    clientes,
    loading,
    gestores,
    transferindoCliente,
    pagination,
    handleTransferirCliente,
    handleStatusChange,
    goToPage,
    nextPage,
    prevPage,
    changeItemsPerPage
  }
}
