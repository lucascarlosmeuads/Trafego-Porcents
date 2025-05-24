
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export function useManagerData(selectedManager: string) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getTableName = (managerName: string) => {
    const tableMapping: { [key: string]: string } = {
      'Lucas Falcão': 'clientes_lucas_falcao',
      'Andreza': 'clientes_andreza'
    }
    
    return tableMapping[managerName] || 'clientes_andreza'
  }

  const fetchClientes = async (showToast = false) => {
    if (!selectedManager) return

    setLoading(true)
    setError(null)

    try {
      const tableName = getTableName(selectedManager)
      console.log('🔍 Buscando TODOS os dados da tabela:', tableName)
      
      // BUSCANDO TODOS OS REGISTROS SEM LIMITAÇÃO E ORDENANDO POR ID
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .order('id', { ascending: true, nullsLast: true })

      console.log('📊 Resposta do Supabase:', {
        data: data?.length || 0,
        count,
        error,
        tableName
      })

      if (error) {
        console.error('❌ Erro ao buscar clientes:', error)
        setError(`Erro ao carregar dados de ${selectedManager}: ${error.message}`)
        setClientes([])
        if (showToast) {
          toast({
            title: "Erro",
            description: `Erro ao atualizar dados de ${selectedManager}`,
            variant: "destructive"
          })
        }
      } else {
        console.log(`✅ TOTAL de dados recebidos do Supabase para ${selectedManager}:`, data?.length || 0)
        console.log(`📊 Count exato do banco:`, count)
        
        if (data?.length !== count) {
          console.warn(`⚠️ DISCREPÂNCIA CRÍTICA: Dados recebidos: ${data?.length}, Count do DB: ${count}`)
        }
        
        // Processando TODOS os registros e verificando problemas de ID
        const clientesFormatados = (data || []).map((item: any, index: number) => {
          // Verificar se o ID está presente e válido
          let clienteId = item.id
          
          if (!clienteId || clienteId === null || clienteId === undefined) {
            console.warn(`⚠️ Cliente ${index + 1} sem ID válido no banco:`, {
              registro: item,
              nome: item.nome_cliente,
              originalId: item.id
            })
            // Usar created_at como fallback ou gerar um ID baseado em outros campos
            clienteId = item.created_at ? `temp-${item.created_at}-${index}` : `temp-${index}-${item.nome_cliente || 'sem-nome'}`
          } else {
            clienteId = String(clienteId)
          }
          
          console.log(`📋 Processando cliente ${index + 1}:`, {
            id: clienteId,
            originalId: item.id,
            nome: item.nome_cliente,
            status: item.status_campanha
          })
          
          const cliente = {
            id: clienteId,
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
        })
        
        console.log(`🎯 RESULTADO FINAL: ${clientesFormatados.length} clientes formatados`)
        console.log(`📋 IDs dos clientes processados:`, clientesFormatados.map(c => ({ 
          id: c.id, 
          nome: c.nome_cliente,
          isTemp: c.id.toString().startsWith('temp-')
        })))
        
        // DEFININDO TODOS OS CLIENTES SEM FILTROS
        setClientes(clientesFormatados)
        
        // Contar quantos têm IDs temporários
        const tempIds = clientesFormatados.filter(c => c.id.toString().startsWith('temp-')).length
        
        if (showToast) {
          toast({
            title: "Sucesso",
            description: `Dados de ${selectedManager} atualizados - ${clientesFormatados.length} registros (${tempIds} com IDs temporários)`
          })
        }
        
        if (tempIds > 0) {
          console.warn(`⚠️ ATENÇÃO: ${tempIds} registros estão com IDs temporários. Verifique o banco de dados.`)
        }
      }
    } catch (err) {
      console.error('💥 Erro na busca:', err)
      setError(`Erro ao carregar dados de ${selectedManager}`)
      setClientes([])
      if (showToast) {
        toast({
          title: "Erro",
          description: `Erro ao atualizar dados de ${selectedManager}`,
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
    console.log(`👤 Manager: ${selectedManager}`)

    // Verificar se é um ID temporário
    if (id.toString().startsWith('temp-')) {
      console.error('❌ Tentativa de atualizar registro com ID temporário:', id)
      toast({
        title: "Erro",
        description: "Não é possível atualizar este registro pois ele não tem um ID válido no banco de dados",
        variant: "destructive"
      })
      return false
    }

    if (!id || id.trim() === '') {
      console.error('❌ ID do cliente está vazio ou inválido:', id)
      return false
    }

    if (!selectedManager) {
      console.error('❌ Manager não selecionado')
      return false
    }

    if (!field || field.trim() === '') {
      console.error('❌ Campo está vazio ou inválido:', field)
      return false
    }

    try {
      const tableName = getTableName(selectedManager)
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
        if (checkError.code === 'PGRST116') {
          console.error('❌ Registro não encontrado com ID:', numericId)
        }
        return false
      }

      if (!existingData) {
        console.error('❌ Nenhum registro encontrado com ID:', numericId)
        return false
      }

      console.log('✅ Registro encontrado:', existingData)
      console.log(`🔄 Status atual: "${existingData.status_campanha}" -> Novo status: "${value}"`)
      
      console.log('🔄 Executando UPDATE...')
      const { data: updateData, error: updateError } = await supabase
        .from(tableName)
        .update({ [field]: value })
        .eq('id', numericId)
        .select()

      if (updateError) {
        console.error('❌ Erro ao atualizar cliente:', updateError)
        console.error('🔍 Detalhes do erro:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        })
        return false
      }

      console.log('✅ Dados atualizados no Supabase:', updateData)

      // Atualizar o estado local imediatamente
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
    if (!selectedManager) return

    const tableName = getTableName(selectedManager)
    console.log('🔴 Configurando realtime para tabela:', tableName)

    // Buscar dados iniciais
    fetchClientes()

    // Configurar canal de realtime com um nome único
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
              id: String(payload.new.id || `temp-${Date.now()}`),
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
              id: String(payload.new.id || ''),
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
          // Tentar reconectar após um delay
          setTimeout(() => {
            console.log('🔄 Tentando reconectar realtime...')
            fetchClientes()
          }, 2000)
        }
      })

    // Cleanup do canal quando o componente desmontar ou gerente mudar
    return () => {
      console.log('🧹 Removendo canal de realtime para:', tableName)
      supabase.removeChannel(channel)
    }
  }, [selectedManager])

  const refetchWithToast = () => fetchClientes(true)

  return {
    clientes,
    loading,
    error,
    updateCliente,
    refetch: refetchWithToast
  }
}
