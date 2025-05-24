
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export function useManagerData(userEmail: string, isAdmin: boolean) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentManager, setCurrentManager] = useState<string>('')

  // Determinar o gestor baseado no email logado
  const determineManager = (email: string): string => {
    if (email === 'lucas@admin.com') {
      return 'Lucas Falcão' // Admin pode ver Lucas por padrão
    }
    
    // Mapear outros emails para gestores
    const managerMapping: { [key: string]: string } = {
      'andreza@gestor.com': 'Andreza',
      'lucas.falcao@gestor.com': 'Lucas Falcão'
    }
    
    return managerMapping[email] || 'Andreza' // Fallback para Andreza
  }

  // Determinar tabela baseada no email do gestor
  const getTableName = (email: string): string => {
    const manager = determineManager(email)
    const tableMapping: { [key: string]: string } = {
      'Lucas Falcão': 'clientes_lucas_falcao',
      'Andreza': 'clientes_andreza'
    }
    
    return tableMapping[manager] || 'clientes_andreza'
  }

  const fetchClientes = async (showToast = false) => {
    if (!userEmail) return

    setLoading(true)
    setError(null)

    try {
      const manager = determineManager(userEmail)
      const tableName = getTableName(userEmail)
      
      setCurrentManager(manager)
      
      console.log('🔍 Buscando dados para:', { userEmail, manager, tableName })
      
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .order('id', { ascending: true })

      console.log('📊 Resposta do Supabase:', {
        data: data?.length || 0,
        count,
        error,
        tableName,
        userEmail
      })

      if (error) {
        console.error('❌ Erro ao buscar clientes:', error)
        setError(`Erro ao carregar dados: ${error.message}`)
        setClientes([])
        if (showToast) {
          toast({
            title: "Erro",
            description: `Erro ao atualizar dados`,
            variant: "destructive"
          })
        }
      } else {
        console.log(`✅ Dados recebidos para ${manager}:`, data?.length || 0)
        
        const clientesFormatados = (data || []).map((item: any) => {
          if (!item.id || item.id === null || item.id === undefined) {
            console.error('⚠️ Registro sem ID encontrado:', item)
            return null
          }
          
          const cliente = {
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
            comissao_paga: item.comissao_paga || false,
            valor_comissao: item.valor_comissao || 60.00,
            created_at: item.created_at || ''
          }
          
          return cliente
        }).filter(Boolean)
        
        console.log(`🎯 RESULTADO FINAL: ${clientesFormatados.length} clientes válidos para ${manager}`)
        setClientes(clientesFormatados)
        
        if (showToast) {
          toast({
            title: "Sucesso",
            description: `Dados atualizados - ${clientesFormatados.length} registros`
          })
        }
      }
    } catch (err) {
      console.error('💥 Erro na busca:', err)
      setError(`Erro ao carregar dados`)
      setClientes([])
      if (showToast) {
        toast({
          title: "Erro",
          description: `Erro ao atualizar dados`,
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const updateCliente = async (id: string, field: string, value: string | boolean | number) => {
    console.log(`🚀 === INICIANDO ATUALIZAÇÃO ===`)
    console.log(`🆔 ID recebido: "${id}" (tipo: ${typeof id})`)
    console.log(`🎯 Campo: ${field}`)
    console.log(`💾 Valor: ${value}`)
    console.log(`👤 User Email: ${userEmail}`)
    console.log(`👤 Manager: ${currentManager}`)

    if (!id || id.trim() === '') {
      console.error('❌ ID do cliente está vazio ou inválido:', id)
      return false
    }

    if (!userEmail) {
      console.error('❌ Email do usuário não fornecido')
      return false
    }

    if (!field || field.trim() === '') {
      console.error('❌ Campo está vazio ou inválido:', field)
      return false
    }

    try {
      const tableName = getTableName(userEmail)
      const numericId = parseInt(id)
      
      console.log(`📋 Tabela: ${tableName}`)
      console.log(`🔢 ID convertido: ${numericId} (tipo: ${typeof numericId})`)
      
      if (isNaN(numericId) || numericId <= 0) {
        console.error('❌ ID inválido após conversão:', { original: id, converted: numericId })
        return false
      }

      console.log('🔍 Verificando se o registro existe...')
      const { data: existingData, error: checkError } = await supabase
        .from(tableName)
        .select('id, status_campanha, nome_cliente')
        .eq('id', numericId)
        .single()

      if (checkError) {
        console.error('❌ Erro ao verificar existência do registro:', checkError)
        return false
      }

      if (!existingData) {
        console.error('❌ Nenhum registro encontrado com ID:', numericId)
        return false
      }

      console.log('✅ Registro encontrado:', existingData)
      
      console.log('🔄 Executando UPDATE...')
      const { data: updateData, error: updateError } = await supabase
        .from(tableName)
        .update({ [field]: value })
        .eq('id', numericId)
        .select()

      if (updateError) {
        console.error('❌ Erro ao atualizar cliente:', updateError)
        return false
      }

      console.log('✅ Dados atualizados no Supabase:', updateData)

      setClientes(prev => 
        prev.map(cliente => 
          cliente.id === id 
            ? { ...cliente, [field]: value }
            : cliente
        )
      )

      console.log('🎉 === ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===')
      return true
    } catch (err) {
      console.error('💥 Erro na atualização (catch):', err)
      return false
    }
  }

  // Configurar listener de realtime para atualizações automáticas
  useEffect(() => {
    if (!userEmail) return

    const tableName = getTableName(userEmail)
    const manager = determineManager(userEmail)
    
    console.log('🔴 Configurando realtime para:', { userEmail, manager, tableName })

    // Buscar dados iniciais
    fetchClientes()

    // Configurar canal de realtime
    const channel = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName
        },
        (payload) => {
          console.log('🔄 Mudança detectada na tabela:', tableName, payload)
          
          if (payload.eventType === 'INSERT') {
            console.log('➕ Novo cliente inserido:', payload.new)
            const novoCliente = {
              id: String(payload.new.id),
              nome_cliente: payload.new.nome_cliente || '',
              telefone: payload.new.telefone || '',
              email_cliente: payload.new.email_cliente || '',
              vendedor: payload.new.vendedor || '',
              email_gestor: payload.new.email_gestor || '',
              status_campanha: payload.new.status_campanha || '',
              data_venda: payload.new.data_venda || '',
              data_limite: payload.new.data_limite || '',
              link_grupo: payload.new.link_grupo || '',
              link_briefing: payload.new.link_briefing || '',
              link_criativo: payload.new.link_criativo || '',
              link_site: payload.new.link_site || '',
              numero_bm: payload.new.numero_bm || '',
              created_at: payload.new.created_at || '',
              comissao_paga: payload.new.comissao_paga || false,
              valor_comissao: payload.new.valor_comissao || 60.00
            }
            
            setClientes(prev => {
              const updated = [novoCliente, ...prev]
              return updated.sort((a, b) => {
                const aId = parseInt(a.id) || 0
                const bId = parseInt(b.id) || 0
                return aId - bId
              })
            })
          } else if (payload.eventType === 'UPDATE') {
            console.log('🔄 Cliente atualizado via realtime:', payload.new)
            const clienteAtualizado = {
              id: String(payload.new.id),
              nome_cliente: payload.new.nome_cliente || '',
              telefone: payload.new.telefone || '',
              email_cliente: payload.new.email_cliente || '',
              vendedor: payload.new.vendedor || '',
              email_gestor: payload.new.email_gestor || '',
              status_campanha: payload.new.status_campanha || '',
              data_venda: payload.new.data_venda || '',
              data_limite: payload.new.data_limite || '',
              link_grupo: payload.new.link_grupo || '',
              link_briefing: payload.new.link_briefing || '',
              link_criativo: payload.new.link_criativo || '',
              link_site: payload.new.link_site || '',
              numero_bm: payload.new.numero_bm || '',
              created_at: payload.new.created_at || '',
              comissao_paga: payload.new.comissao_paga || false,
              valor_comissao: payload.new.valor_comissao || 60.00
            }
            
            setClientes(prev => 
              prev.map(cliente => 
                cliente.id === clienteAtualizado.id ? clienteAtualizado : cliente
              )
            )
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ Cliente removido:', payload.old)
            setClientes(prev => 
              prev.filter(cliente => cliente.id !== String(payload.old.id))
            )
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Status do realtime para ${tableName}:`, status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime conectado com sucesso!')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro no canal de realtime')
          setTimeout(() => {
            console.log('🔄 Tentando reconectar realtime...')
            fetchClientes()
          }, 2000)
        }
      })

    return () => {
      console.log('🧹 Removendo canal de realtime para:', tableName)
      supabase.removeChannel(channel)
    }
  }, [userEmail])

  const refetchWithToast = () => fetchClientes(true)

  return {
    clientes,
    loading,
    error,
    updateCliente,
    refetch: refetchWithToast,
    currentManager
  }
}
