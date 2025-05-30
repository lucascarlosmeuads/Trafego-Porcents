
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface PaginationState {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
}

export function useAdminTableLogic(selectedManager?: string | null, filterType?: string) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [gestores, setGestores] = useState<Array<{ email: string, nome: string }>>([])
  const [transferindoCliente, setTransferindoCliente] = useState<string | null>(null)
  const [updatingComission, setUpdatingComission] = useState<string | null>(null)
  const [editingComissionValue, setEditingComissionValue] = useState<string | null>(null)
  const [editingBM, setEditingBM] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<{ clienteId: string, field: string } | null>(null)
  const [comissionValueInput, setComissionValueInput] = useState('')
  const [bmValue, setBmValue] = useState('')
  const [linkValue, setLinkValue] = useState('')
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

  const buildQuery = () => {
    let query = supabase.from('todos_clientes').select('*')

    // Aplicar filtros
    if (selectedManager && selectedManager !== '__GESTORES__') {
      query = query.eq('email_gestor', selectedManager)
    }

    if (filterType) {
      switch (filterType) {
        case 'sites-pendentes':
          query = query.eq('status_campanha', 'aguardando_link')
          break
        case 'saques-pendentes':
          query = query.eq('comissao', 'Solicitado')
          break
      }
    }

    return query
  }

  const fetchTotalCount = async () => {
    try {
      const query = buildQuery()
      const { count, error } = await query.select('*', { count: 'exact', head: true })

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
      
      // Buscar contagem total
      const totalCount = await fetchTotalCount()
      const totalPages = Math.ceil(totalCount / pagination.itemsPerPage)
      
      // Calcular offset
      const offset = (pagination.currentPage - 1) * pagination.itemsPerPage

      const query = buildQuery()
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + pagination.itemsPerPage - 1)

      if (error) {
        console.error('❌ Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: `Erro ao carregar dados: ${error.message}`,
          variant: "destructive"
        })
      } else {
        const formattedClientes = (data || []).map(cliente => ({
          ...cliente,
          data_venda: cliente.data_venda ? String(cliente.data_venda) : null,
          created_at: cliente.created_at ? String(cliente.created_at) : null,
          status_campanha: cliente.status_campanha ? String(cliente.status_campanha) : ''
        }))
        
        setClientes(formattedClientes)
        
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

  const updateField = async (id: string, field: keyof Cliente, value: string | boolean) => {
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

  const handleSiteStatusChange = (id: string, newStatus: string) => {
    updateField(id, 'site_status', newStatus)
  }

  const handleComissionToggle = async (clienteId: string, currentStatus: boolean): Promise<boolean> => {
    setUpdatingComission(clienteId)
    try {
      const newStatus = !currentStatus
      await updateField(clienteId, 'comissao_paga', newStatus)
      return true
    } catch (error) {
      console.error('❌ Erro ao toggle comissão:', error)
      return false
    } finally {
      setUpdatingComission(null)
    }
  }

  const handleComissionValueEdit = (clienteId: string, currentValue: number) => {
    setEditingComissionValue(clienteId)
    setComissionValueInput(currentValue.toString())
  }

  const handleComissionValueSave = (clienteId: string, newValue: number) => {
    updateField(clienteId, 'valor_comissao', newValue)
    setEditingComissionValue(null)
    setComissionValueInput('')
  }

  const handleComissionValueCancel = () => {
    setEditingComissionValue(null)
    setComissionValueInput('')
  }

  const handleBMEdit = (clienteId: string, currentValue: string) => {
    setEditingBM(clienteId)
    setBmValue(currentValue)
  }

  const handleBMSave = async (clienteId: string) => {
    await updateField(clienteId, 'numero_bm', bmValue)
    setEditingBM(null)
    setBmValue('')
  }

  const handleBMCancel = () => {
    setEditingBM(null)
    setBmValue('')
  }

  const handleLinkEdit = (clienteId: string, field: string, currentValue: string) => {
    setEditingLink({ clienteId, field })
    setLinkValue(currentValue)
  }

  const handleLinkSave = async (clienteId: string): Promise<boolean> => {
    if (!editingLink) return false
    
    try {
      await updateField(clienteId, editingLink.field as keyof Cliente, linkValue)
      setEditingLink(null)
      setLinkValue('')
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar link:', error)
      return false
    }
  }

  const handleLinkCancel = () => {
    setEditingLink(null)
    setLinkValue('')
  }

  const handleSitePagoChange = (clienteId: string, newValue: boolean) => {
    updateField(clienteId, 'site_pago', newValue)
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
      currentPage: 1
    }))
  }

  return {
    clientes,
    loading,
    gestores,
    transferindoCliente,
    updatingComission,
    editingComissionValue,
    editingBM,
    editingLink,
    comissionValueInput,
    bmValue,
    linkValue,
    pagination,
    setComissionValueInput,
    setBmValue,
    setLinkValue,
    handleTransferirCliente,
    handleStatusChange,
    handleSiteStatusChange,
    handleComissionToggle,
    handleComissionValueEdit,
    handleComissionValueSave,
    handleComissionValueCancel,
    handleBMEdit,
    handleBMSave,
    handleBMCancel,
    handleLinkEdit,
    handleLinkSave,
    handleLinkCancel,
    handleSitePagoChange,
    goToPage,
    nextPage,
    prevPage,
    changeItemsPerPage
  }
}
