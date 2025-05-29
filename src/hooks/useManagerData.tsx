import { useState, useEffect, useCallback } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'

export function useManagerData(email: string, isAdminUser: boolean, selectedManager?: string) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentManager, setCurrentManager] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

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
        comissao: item.comissao || 'Pendente',
        valor_comissao: Number(item.valor_comissao || 60),
        created_at: item.created_at || '',
        site_status: item.site_status || 'pendente',
        descricao_problema: item.descricao_problema || '',
        saque_solicitado: Boolean(item.saque_solicitado || false)
      }))
  }

  const fetchClientes = useCallback(async () => {
    // Prevenir loops infinitos com retry limit
    if (retryCount > 3) {
      console.error('🚨 [useManagerData] Máximo de tentativas atingido, parando para evitar loop infinito')
      setLoading(false)
      setError('Erro: Muitas tentativas de recarregamento. Verifique a configuração.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 [useManagerData] Iniciando busca de clientes - Tentativa:', retryCount + 1)
      console.log('🔍 [useManagerData] Email:', email)
      console.log('🔍 [useManagerData] isAdminUser:', isAdminUser)
      console.log('🔍 [useManagerData] selectedManager:', selectedManager)

      const normalizedEmail = email?.toLowerCase().trim() || ''
      const isSitesUser = normalizedEmail.includes('criador') || normalizedEmail.includes('site') || normalizedEmail.includes('webdesign')

      let query = supabase.from('todos_clientes').select('*')

      if (isSitesUser) {
        // Para usuários de sites: buscar TODOS os clientes aguardando links, independente do gestor
        query = query.eq('site_status', 'aguardando_link')
        setCurrentManager('Criador de Sites')
        console.log('🎯 [useManagerData] Modo SITES: buscando aguardando_link de TODOS os gestores')
      } else if (isAdminUser) {
        if (selectedManager && selectedManager !== 'Todos os Clientes' && selectedManager !== null) {
          query = query.eq('email_gestor', selectedManager)
          setCurrentManager(selectedManager)
          console.log('🎯 [useManagerData] Modo ADMIN: filtro por selectedManager:', selectedManager)
        } else {
          setCurrentManager('Todos os Clientes')
          console.log('🎯 [useManagerData] Modo ADMIN: todos os clientes')
        }
      } else {
        // Para gestores normais: apenas seus próprios clientes
        query = query.eq('email_gestor', email)
        setCurrentManager(email)
        console.log('🎯 [useManagerData] Modo GESTOR: filtro por email:', email)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useManagerData] Erro de banco:', error)
        setError(`Erro de banco de dados: ${error.message}`)
        setClientes([])
      } else if (data) {
        const clientesValidados = validateAndSanitizeClienteData(data)
        console.log('✅ [useManagerData] Clientes carregados:', clientesValidados.length)
        console.log('📊 [useManagerData] Tipo de usuário:', isSitesUser ? 'SITES' : isAdminUser ? 'ADMIN' : 'GESTOR')
        
        if (clientesValidados.length > 0) {
          console.log('📊 [useManagerData] Primeiros clientes:', clientesValidados.slice(0, 3).map(c => ({ 
            id: c.id, 
            nome: c.nome_cliente, 
            email_gestor: c.email_gestor,
            site_status: c.site_status
          })))
        }
        
        setClientes(clientesValidados)
        setRetryCount(0) // Reset retry count on success
      }
    } catch (e) {
      console.error('💥 [useManagerData] Erro crítico:', e)
      setError('Erro crítico de sistema.')
      setClientes([])
    } finally {
      setLoading(false)
    }
  }, [email, isAdminUser, selectedManager, retryCount])

  const refetchWithRetry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    fetchClientes()
  }, [fetchClientes])

  useEffect(() => {
    setRetryCount(0) // Reset retry count when dependencies change
    fetchClientes()
    
    const channel = supabase
      .channel('any')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos_clientes' }, () => {
        console.log('🔄 [useManagerData] Realtime update detected')
        fetchClientes()
      })
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
    refetch: refetchWithRetry,
    currentManager
  }
}
