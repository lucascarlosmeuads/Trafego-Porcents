import { useState, useEffect, useCallback } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'

export function useManagerData(email: string, isAdminUser: boolean, selectedManager?: string) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentManager, setCurrentManager] = useState<string | null>(null)

  const updateCliente = async (clienteId: string, field: string, value: any): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', clienteId)

      if (error) return false

      setClientes(prev =>
        prev.map(cliente =>
          cliente.id === clienteId ? { ...cliente, [field]: value } : cliente
        )
      )
      return true
    } catch {
      return false
    }
  }

  const addCliente = async (clienteData: any): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('todos_clientes')
        .insert([clienteData])
        .select()

      if (error || !data) return false
      setClientes(prev => [...prev, ...data])
      return true
    } catch {
      return false
    }
  }

  const validateAndSanitizeClienteData = (rawData: any[]): Cliente[] => {
    return rawData
      .filter((item) => item?.id && typeof item.nome_cliente === 'string')
      .map((item) => ({
        id: String(item.id),
        data_venda: item.data_venda || '',
        nome_cliente: item.nome_cliente || '',
        telefone: item.telefone || '',
        email_cliente: item.email_cliente || '',
        vendedor: item.vendedor || '',
        email_gestor: item.email_gestor || '',
        status_campanha: item.status_campanha || 'Preenchimento do Formulário',
        data_limite: item.data_limite || '',
        link_grupo: item.link_grupo || '',
        link_briefing: item.link_briefing || '',
        link_criativo: item.link_criativo || '',
        link_site: item.link_site || '',
        numero_bm: item.numero_bm || '',
        comissao_paga: Boolean(item.comissao_paga),
        valor_comissao: Number(item.valor_comissao || 60),
        created_at: item.created_at || '',
        site_status: item.site_status || 'pendente',
        descricao_problema: item.descricao_problema || '',
        saque_solicitado: Boolean(item.saque_solicitado || false)
      }))
  }

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const normalizedEmail = email?.toLowerCase().trim() || ''
      const isSitesUser = normalizedEmail.includes('criador') || normalizedEmail.includes('site') || normalizedEmail.includes('webdesign')

      let query = supabase.from('todos_clientes').select('*')

      if (isSitesUser) {
        query = query.eq('site_status', 'aguardando_link')
        setCurrentManager('Criador de Sites')
      } else if (isAdminUser) {
        if (selectedManager && selectedManager !== 'Todos os Clientes') {
          query = query.eq('email_gestor', selectedManager)
          setCurrentManager(selectedManager)
        } else {
          setCurrentManager('Todos os Clientes')
        }
      } else {
        query = query.eq('email_gestor', email)
        setCurrentManager(email)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        setError(`Erro de banco de dados: ${error.message}`)
        setClientes([])
      } else if (data) {
        setClientes(validateAndSanitizeClienteData(data))
      }
    } catch (e) {
      setError('Erro crítico de sistema.')
      setClientes([])
    } finally {
      setLoading(false)
    }
  }, [email, isAdminUser, selectedManager])

  useEffect(() => {
    fetchClientes()
    const channel = supabase
      .channel('any')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos_clientes' }, () => fetchClientes())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchClientes])

  return {
    clientes,
    loading,
    error,
    updateCliente,
    addCliente,
    refetch: fetchClientes,
    currentManager
  }
}
