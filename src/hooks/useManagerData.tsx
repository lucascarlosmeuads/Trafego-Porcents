
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
      let query = supabase
        .from('todos_clientes')
        .select('*')

      // Verificar se é usuário responsável por sites
      const isSitesUser = email.includes('sites') || email.includes('site@') || email.includes('webdesign')
      
      if (isSitesUser) {
        console.log('🌐 [useManagerData] Modo sites - filtrando por site_status = aguardando_link')
        query = query.eq('site_status', 'aguardando_link')
        setCurrentManager('Responsável por Sites')
      } else if (isAdminUser) {
        if (selectedManager && selectedManager !== 'Todos os Clientes') {
          console.log('👑 [useManagerData] Modo admin - filtrando por gestor:', selectedManager)
          query = query.eq('email_gestor', selectedManager)
          setCurrentManager(selectedManager)
        } else {
          console.log('👑 [useManagerData] Modo admin - mostrando todos os clientes')
          setCurrentManager('Todos os Clientes')
        }
      } else {
        // Para não-admins (gestores, vendedores), filtrar por email_gestor
        console.log('👨‍💼 [useManagerData] Modo gestor/vendedor - filtrando por email_gestor')
        query = query.eq('email_gestor', email)
        setCurrentManager(email)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ [useManagerData] Erro ao buscar clientes:', error)
        setError(error.message)
      } else {
        console.log('✅ [useManagerData] Clientes carregados com sucesso:', data.length)
        if (isSitesUser) {
          console.log('🌐 [useManagerData] Clientes aguardando sites:', data.map(c => ({
            nome: c.nome_cliente,
            site_status: c.site_status,
            email: c.email_cliente
          })))
        }
        setClientes(data)
      }
    } catch (error) {
      console.error('💥 [useManagerData] Erro crítico ao buscar clientes:', error)
      setError('Erro ao carregar clientes')
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
