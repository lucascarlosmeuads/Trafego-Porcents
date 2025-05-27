
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

  // Função para validar e sanitizar dados de cliente
  const validateAndSanitizeClienteData = (rawData: any[]): Cliente[] => {
    if (!Array.isArray(rawData)) {
      console.warn('⚠️ [useManagerData] Dados recebidos não são um array:', rawData)
      return []
    }

    const validatedClientes = rawData
      .filter((item, index) => {
        // Validar campos obrigatórios
        if (!item || typeof item !== 'object') {
          console.warn(`⚠️ [useManagerData] Item ${index} inválido:`, item)
          return false
        }

        if (!item.id) {
          console.warn(`⚠️ [useManagerData] Cliente sem ID no índice ${index}:`, item)
          return false
        }

        if (!item.nome_cliente || typeof item.nome_cliente !== 'string') {
          console.warn(`⚠️ [useManagerData] Cliente ${item.id} sem nome válido:`, item)
          return false
        }

        return true
      })
      .map((item, index) => {
        try {
          return {
            id: String(item.id || ''),
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
          }
        } catch (formatError) {
          console.error(`❌ [useManagerData] Erro ao formatar cliente ${index}:`, formatError, item)
          return null
        }
      })
      .filter((cliente): cliente is Cliente => cliente !== null)

    // Remover duplicatas baseado no ID
    const uniqueClientes = validatedClientes.reduce((acc: Cliente[], current) => {
      const exists = acc.find(item => item.id === current.id)
      if (!exists) {
        acc.push(current)
      } else {
        console.warn(`⚠️ [useManagerData] Duplicata removida para cliente ID: ${current.id}`)
      }
      return acc
    }, [])

    console.log(`✅ [useManagerData] Dados validados: ${rawData.length} → ${uniqueClientes.length} clientes válidos`)
    return uniqueClientes
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
        
        try {
          // Para usuários de sites, buscar TODOS os clientes com site_status = 'aguardando_link'
          const { data, error } = await supabase
            .from('todos_clientes')
            .select('*')
            .eq('site_status', 'aguardando_link')

          if (error) {
            console.error('❌ [useManagerData] Erro Supabase ao buscar clientes para sites:', error)
            setError(`Erro de banco de dados: ${error.message}`)
            setClientes([])
          } else if (!data) {
            console.log('⚠️ [useManagerData] Nenhum dado retornado para sites')
            setClientes([])
          } else {
            console.log('📊 [useManagerData] Dados brutos recebidos para sites:', data.length)
            
            // Validar e sanitizar os dados
            const clientesValidados = validateAndSanitizeClienteData(data)
            console.log('✅ [useManagerData] Clientes aguardando sites validados:', clientesValidados.length)
            
            if (clientesValidados.length > 0) {
              console.log('🌐 [useManagerData] Primeiros 3 clientes:', clientesValidados.slice(0, 3).map(c => ({
                id: c.id,
                nome: c.nome_cliente,
                site_status: c.site_status,
                email_gestor: c.email_gestor
              })))
            }
            
            setClientes(clientesValidados)
          }
          setCurrentManager('Responsável por Sites')
        } catch (fetchError) {
          console.error('💥 [useManagerData] Erro de rede/crítico ao buscar clientes para sites:', fetchError)
          setError('Erro de conexão. Verifique sua internet e tente novamente.')
          setClientes([])
        }
        
      } else if (isAdminUser) {
        // Lógica para admin
        try {
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
            console.error('❌ [useManagerData] Erro Supabase ao buscar clientes (admin):', error)
            setError(`Erro de banco de dados: ${error.message}`)
            setClientes([])
          } else if (!data) {
            console.log('⚠️ [useManagerData] Nenhum dado retornado para admin')
            setClientes([])
          } else {
            console.log('📊 [useManagerData] Dados brutos recebidos para admin:', data.length)
            const clientesValidados = validateAndSanitizeClienteData(data)
            console.log('✅ [useManagerData] Clientes carregados para admin:', clientesValidados.length)
            setClientes(clientesValidados)
          }
        } catch (fetchError) {
          console.error('💥 [useManagerData] Erro de rede/crítico ao buscar clientes (admin):', fetchError)
          setError('Erro de conexão. Verifique sua internet e tente novamente.')
          setClientes([])
        }
        
      } else {
        // Para gestores e vendedores normais
        console.log('👨‍💼 [useManagerData] Modo gestor/vendedor - filtrando por email_gestor')
        
        try {
          const { data, error } = await supabase
            .from('todos_clientes')
            .select('*')
            .eq('email_gestor', email)

          if (error) {
            console.error('❌ [useManagerData] Erro Supabase ao buscar clientes (gestor):', error)
            setError(`Erro de banco de dados: ${error.message}`)
            setClientes([])
          } else if (!data) {
            console.log('⚠️ [useManagerData] Nenhum dado retornado para gestor')
            setClientes([])
          } else {
            console.log('📊 [useManagerData] Dados brutos recebidos para gestor:', data.length)
            const clientesValidados = validateAndSanitizeClienteData(data)
            console.log('✅ [useManagerData] Clientes carregados para gestor:', clientesValidados.length)
            setClientes(clientesValidados)
          }
          setCurrentManager(email)
        } catch (fetchError) {
          console.error('💥 [useManagerData] Erro de rede/crítico ao buscar clientes (gestor):', fetchError)
          setError('Erro de conexão. Verifique sua internet e tente novamente.')
          setClientes([])
        }
      }

    } catch (criticalError) {
      console.error('💥 [useManagerData] ERRO CRÍTICO GERAL:', criticalError)
      setError('Erro crítico de sistema. Tente novamente em alguns minutos.')
      setClientes([])
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
