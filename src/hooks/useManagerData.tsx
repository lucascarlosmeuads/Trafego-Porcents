
import { useState, useEffect, useCallback } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'

export function useManagerData(email: string, isAdminUser: boolean, selectedManager?: string) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentManager, setCurrentManager] = useState<string | null>(null)

  const updateCliente = async (clienteId: string, field: string, value: any): Promise<boolean> => {
    try {
      console.log(`🛠️ [useManagerData] Atualizando cliente ${clienteId}: ${field} para "${value}"`)
      const { error } = await supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', clienteId)

      if (error) {
        console.error('❌ [useManagerData] Erro ao atualizar cliente:', error)
        return false
      }

      console.log('✅ [useManagerData] Cliente atualizado com sucesso')
      setClientes(prevClientes =>
        prevClientes.map(cliente =>
          cliente.id === clienteId ? { ...cliente, [field]: value } : cliente
        )
      )
      return true
    } catch (err) {
      console.error('💥 [useManagerData] Erro crítico ao atualizar cliente:', err)
      return false
    }
  }

  const addCliente = async (clienteData: any): Promise<boolean> => {
    try {
      console.log('➕ [useManagerData] Adicionando novo cliente:', clienteData)
      const { data, error } = await supabase
        .from('todos_clientes')
        .insert([clienteData])
        .select()

      if (error) {
        console.error('❌ [useManagerData] Erro ao adicionar cliente:', error)
        return false
      }

      console.log('✅ [useManagerData] Cliente adicionado com sucesso:', data)
      setClientes(prevClientes => [...prevClientes, ...data])
      return true
    } catch (err) {
      console.error('💥 [useManagerData] Erro crítico ao adicionar cliente:', err)
      return false
    }
  }

  const fetchClientes = useCallback(async () => {
    if (!email) {
      console.log('❌ [useManagerData] Email não fornecido')
      setError('Email do usuário não encontrado')
      setLoading(false)
      return
    }

    console.log('🔍 [useManagerData] === INICIANDO BUSCA ===')
    console.log('📧 Email:', email)
    console.log('🔒 IsAdmin:', isAdminUser)
    console.log('👤 Selected Manager:', selectedManager)

    setLoading(true)
    setError(null)

    try {
      // Verificar se é usuário responsável por sites
      const isSitesUser = email.includes('sites') || email.includes('site@') || email.includes('webdesign')
      
      if (isSitesUser) {
        console.log('🌐 [useManagerData] Modo sites - buscando clientes com site_status = aguardando_link')
        
        // Para usuários de sites, buscar TODOS os clientes com site_status = 'aguardando_link'
        const { data, error } = await supabase
          .from('todos_clientes')
          .select('*')
          .eq('site_status', 'aguardando_link')

        if (error) {
          console.error('❌ [useManagerData] Erro ao buscar clientes para sites:', error)
          setError(`Erro ao carregar clientes: ${error.message}`)
        } else {
          console.log('✅ [useManagerData] Clientes aguardando sites carregados:', data.length)
          console.log('🌐 [useManagerData] Detalhes dos clientes:', data.map(c => ({
            id: c.id,
            nome: c.nome_cliente,
            site_status: c.site_status,
            email_gestor: c.email_gestor
          })))
          setClientes(data || [])
        }
        setCurrentManager('Responsável por Sites')
        
      } else if (isAdminUser) {
        // Lógica para admin
        let query = supabase
          .from('todos_clientes')
          .select('*')

        if (selectedManager && selectedManager !== 'Todos os Clientes') {
          console.log('👑 [useManagerData] Modo admin - filtrando por gestor:', selectedManager)
          query = query.eq('email_gestor', selectedManager)
          setCurrentManager(selectedManager)
        } else {
          console.log('👑 [useManagerData] Modo admin - mostrando todos os clientes')
          setCurrentManager('Todos os Clientes')
        }

        const { data, error } = await query

        if (error) {
          console.error('❌ [useManagerData] Erro ao buscar clientes (admin):', error)
          setError(`Erro ao carregar clientes: ${error.message}`)
        } else {
          console.log('✅ [useManagerData] Clientes carregados para admin:', data.length)
          setClientes(data || [])
        }
        
      } else {
        // Para gestores e vendedores normais
        console.log('👨‍💼 [useManagerData] Modo gestor/vendedor - filtrando por email_gestor')
        
        const { data, error } = await supabase
          .from('todos_clientes')
          .select('*')
          .eq('email_gestor', email)

        if (error) {
          console.error('❌ [useManagerData] Erro ao buscar clientes (gestor):', error)
          setError(`Erro ao carregar clientes: ${error.message}`)
        } else {
          console.log('✅ [useManagerData] Clientes carregados para gestor:', data.length)
          setClientes(data || [])
        }
        setCurrentManager(email)
      }

    } catch (error) {
      console.error('💥 [useManagerData] Erro crítico ao buscar clientes:', error)
      setError('Erro de conexão ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }, [email, isAdminUser, selectedManager])

  useEffect(() => {
    fetchClientes()

    // Configuração do listener para atualizações em tempo real
    const channel = supabase
      .channel('any')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos_clientes' }, payload => {
        console.log('⚡️ [useManagerData] Mudança detectada via Realtime:', payload)
        fetchClientes() // Refetch para garantir que os dados estão atualizados
      })
      .subscribe()

    return () => {
      console.log('🔴 [useManagerData] Desconectando listener Realtime')
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
