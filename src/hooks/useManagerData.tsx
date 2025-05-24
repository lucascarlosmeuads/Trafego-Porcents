
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export function useManagerData(userEmail: string, isAdmin: boolean, selectedManager?: string) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentManager, setCurrentManager] = useState<string>('')

  // Buscar qual tabela contém o email do gestor
  const findManagerTable = async (email: string): Promise<{ tableName: string; managerName: string } | null> => {
    console.log('🔍 Buscando tabela para email:', email)
    
    const tablesToCheck = [
      { name: 'clientes_andreza', manager: 'Andreza' },
      { name: 'clientes_lucas_falcao', manager: 'Lucas Falcão' }
    ]

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('email_gestor')
          .eq('email_gestor', email)
          .limit(1)

        if (error) {
          console.error(`❌ Erro ao verificar tabela ${table.name}:`, error)
          continue
        }

        if (data && data.length > 0) {
          console.log(`✅ Email encontrado na tabela: ${table.name}`)
          return { tableName: table.name, managerName: table.manager }
        }
      } catch (err) {
        console.error(`💥 Erro na busca da tabela ${table.name}:`, err)
        continue
      }
    }

    console.log('❌ Email não encontrado em nenhuma tabela')
    return null
  }

  // Determinar o gestor baseado no email logado ou gestor selecionado (para admin)
  const determineManager = async (email: string, selectedMgr?: string): Promise<{ manager: string; tableName: string }> => {
    // Se for admin e tiver gestor selecionado, usar o gestor selecionado
    if (isAdmin && selectedMgr) {
      return {
        manager: selectedMgr,
        tableName: getTableName(selectedMgr)
      }
    }
    
    if (email === 'lucas@admin.com') {
      return {
        manager: 'Lucas Falcão',
        tableName: 'clientes_lucas_falcao'
      }
    }
    
    // Mapear emails específicos para gestores (mapeamento direto)
    const managerMapping: { [key: string]: { manager: string; table: string } } = {
      'andreza@gestor.com': { manager: 'Andreza', table: 'clientes_andreza' },
      'lucas.falcao@gestor.com': { manager: 'Lucas Falcão', table: 'clientes_lucas_falcao' },
      'andreza@trafegoporcents.com': { manager: 'Andreza', table: 'clientes_andreza' },
      'lucas.falcao@trafegoporcents.com': { manager: 'Lucas Falcão', table: 'clientes_lucas_falcao' }
    }
    
    // Se for um email específico mapeado, usar o mapeamento
    if (managerMapping[email]) {
      return {
        manager: managerMapping[email].manager,
        tableName: managerMapping[email].table
      }
    }
    
    // 🚀 NOVA LÓGICA: Buscar automaticamente em qual tabela o email existe
    const foundTable = await findManagerTable(email)
    if (foundTable) {
      return {
        manager: foundTable.managerName,
        tableName: foundTable.tableName
      }
    }
    
    // Se não encontrou em nenhuma tabela, extrair nome do email se for @trafegoporcents.com
    if (email.endsWith('@trafegoporcents.com')) {
      const username = email.split('@')[0]
      const managerName = username.charAt(0).toUpperCase() + username.slice(1)
      return {
        manager: managerName,
        tableName: 'clientes_andreza' // Fallback para Andreza
      }
    }
    
    return {
      manager: 'Gestor',
      tableName: 'clientes_andreza' // Fallback para Andreza
    }
  }

  // Determinar tabela baseada no nome do gestor
  const getTableName = (managerName: string): string => {
    const tableMapping: { [key: string]: string } = {
      'Lucas Falcão': 'clientes_lucas_falcao',
      'Andreza': 'clientes_andreza'
    }
    
    return tableMapping[managerName] || 'clientes_andreza'
  }

  // Determinar email do gestor baseado no nome do gestor (para filtros RLS)
  const getManagerEmail = (managerName: string): string => {
    const emailMapping: { [key: string]: string } = {
      'Lucas Falcão': 'lucas.falcao@gestor.com',
      'Andreza': 'andreza@gestor.com'
    }
    
    return emailMapping[managerName] || 'andreza@gestor.com'
  }

  const fetchClientes = async (showToast = false) => {
    if (!userEmail) return

    setLoading(true)
    setError(null)

    try {
      const { manager, tableName } = await determineManager(userEmail, selectedManager)
      
      setCurrentManager(manager)
      
      console.log('🔍 Buscando dados para:', { 
        userEmail, 
        manager, 
        tableName, 
        selectedManager, 
        isAdmin 
      })
      
      // Construir query com filtro por email_gestor se não for admin
      let query = supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .order('id', { ascending: true })

      // Se não for admin, filtrar apenas registros com email_gestor = email logado
      if (!isAdmin) {
        query = query.eq('email_gestor', userEmail)
        console.log('🔒 Aplicando filtro RLS por email_gestor:', userEmail)
      }

      const { data, error, count } = await query

      console.log('📊 Resposta do Supabase:', {
        data: data?.length || 0,
        count,
        error,
        tableName,
        manager,
        filteredBy: !isAdmin ? userEmail : 'sem filtro (admin)'
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
            created_at: item.created_at || '',
            site_status: item.site_status || 'pendente'
          }
          
          return cliente
        }).filter(Boolean)
        
        console.log(`🎯 RESULTADO FINAL: ${clientesFormatados.length} clientes válidos para ${manager}`)
        
        if (clientesFormatados.length === 0 && !isAdmin) {
          console.log('ℹ️ Nenhum cliente encontrado para este gestor')
          setError('Nenhum cliente atribuído a este gestor ainda.')
        }
        
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
      const { manager, tableName } = await determineManager(userEmail, selectedManager)
      const numericId = parseInt(id)
      
      console.log(`📋 Tabela: ${tableName}`)
      console.log(`🔢 ID convertido: ${numericId} (tipo: ${typeof numericId})`)
      
      if (isNaN(numericId) || numericId <= 0) {
        console.error('❌ ID inválido após conversão:', { original: id, converted: numericId })
        return false
      }

      console.log('🔍 Verificando se o registro existe...')
      let checkQuery = supabase
        .from(tableName)
        .select('id, status_campanha, nome_cliente')
        .eq('id', numericId)

      // Se não for admin, aplicar filtro por email_gestor
      if (!isAdmin) {
        checkQuery = checkQuery.eq('email_gestor', userEmail)
      }

      const { data: existingData, error: checkError } = await checkQuery.single()

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
      let updateQuery = supabase
        .from(tableName)
        .update({ [field]: value })
        .eq('id', numericId)

      // Se não for admin, aplicar filtro por email_gestor
      if (!isAdmin) {
        updateQuery = updateQuery.eq('email_gestor', userEmail)
      }

      const { data: updateData, error: updateError } = await updateQuery.select()

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

  const addCliente = async (clienteData: any) => {
    if (!userEmail) {
      console.error('❌ Email do usuário não fornecido')
      return false
    }

    try {
      console.log('🚀 Adicionando novo cliente...')
      console.log('📥 Dados recebidos:', clienteData)
      
      const { manager, tableName } = await determineManager(userEmail, selectedManager)
      
      console.log(`📋 Tabela de destino: ${tableName}`)
      console.log(`👤 Manager: ${manager}`)
      
      // Garantir que NÃO há campo id nos dados
      const {
        id,           // Remover id
        created_at,   // Remover created_at se existir
        ...dadosLimpos
      } = clienteData
      
      // Preparar dados finais sem campos que podem causar conflito
      const novoCliente = {
        ...dadosLimpos,
        email_gestor: userEmail,
        comissao_paga: false,
        valor_comissao: 60.00,
        site_status: 'pendente'
      }

      console.log('🧹 Dados limpos (sem ID):', novoCliente)
      console.log('🔍 Verificando se existe campo id:', 'id' in novoCliente ? 'SIM - ERRO!' : 'NÃO - OK!')

      const { data, error } = await supabase
        .from(tableName)
        .insert([novoCliente])
        .select()

      if (error) {
        console.error('❌ Erro ao adicionar cliente:', error)
        toast({
          title: "Erro",
          description: `Erro ao adicionar cliente: ${error.message}`,
          variant: "destructive"
        })
        return false
      }

      console.log('✅ Cliente adicionado com sucesso:', data)
      
      // Forçar atualização da tabela após inserção
      await fetchClientes()
      
      return true
    } catch (error) {
      console.error('💥 Erro na adição do cliente:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar cliente",
        variant: "destructive"
      })
      return false
    }
  }

  // Configurar listener de realtime para atualizações automáticas
  useEffect(() => {
    if (!userEmail) return

    const setupRealtime = async () => {
      const { manager, tableName } = await determineManager(userEmail, selectedManager)
      
      console.log('🔴 Configurando realtime para:', { userEmail, manager, tableName, selectedManager })

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
            
            // Se não for admin, verificar se a mudança é relevante para este gestor
            if (!isAdmin && payload.new && typeof payload.new === 'object' && 'email_gestor' in payload.new && payload.new.email_gestor !== userEmail) {
              console.log('🚫 Mudança não relevante para este gestor')
              return
            }
            
            if (payload.eventType === 'INSERT') {
              console.log('➕ Novo cliente inserido:', payload.new)
              if (payload.new && typeof payload.new === 'object') {
                const novoCliente = {
                  id: String(payload.new.id || ''),
                  nome_cliente: (payload.new.nome_cliente as string) || '',
                  telefone: (payload.new.telefone as string) || '',
                  email_cliente: (payload.new.email_cliente as string) || '',
                  vendedor: (payload.new.vendedor as string) || '',
                  email_gestor: (payload.new.email_gestor as string) || '',
                  status_campanha: (payload.new.status_campanha as string) || '',
                  data_venda: (payload.new.data_venda as string) || '',
                  data_limite: (payload.new.data_limite as string) || '',
                  link_grupo: (payload.new.link_grupo as string) || '',
                  link_briefing: (payload.new.link_briefing as string) || '',
                  link_criativo: (payload.new.link_criativo as string) || '',
                  link_site: (payload.new.link_site as string) || '',
                  numero_bm: (payload.new.numero_bm as string) || '',
                  created_at: (payload.new.created_at as string) || '',
                  comissao_paga: (payload.new.comissao_paga as boolean) || false,
                  valor_comissao: (payload.new.valor_comissao as number) || 60.00,
                  site_status: (payload.new.site_status as string) || 'pendente'
                }
                
                setClientes(prev => {
                  const updated = [novoCliente, ...prev]
                  return updated.sort((a, b) => {
                    const aId = parseInt(a.id) || 0
                    const bId = parseInt(b.id) || 0
                    return aId - bId
                  })
                })
              }
            } else if (payload.eventType === 'UPDATE') {
              console.log('🔄 Cliente atualizado via realtime:', payload.new)
              if (payload.new && typeof payload.new === 'object') {
                const clienteAtualizado = {
                  id: String(payload.new.id || ''),
                  nome_cliente: (payload.new.nome_cliente as string) || '',
                  telefone: (payload.new.telefone as string) || '',
                  email_cliente: (payload.new.email_cliente as string) || '',
                  vendedor: (payload.new.vendedor as string) || '',
                  email_gestor: (payload.new.email_gestor as string) || '',
                  status_campanha: (payload.new.status_campanha as string) || '',
                  data_venda: (payload.new.data_venda as string) || '',
                  data_limite: (payload.new.data_limite as string) || '',
                  link_grupo: (payload.new.link_grupo as string) || '',
                  link_briefing: (payload.new.link_briefing as string) || '',
                  link_criativo: (payload.new.link_criativo as string) || '',
                  link_site: (payload.new.link_site as string) || '',
                  numero_bm: (payload.new.numero_bm as string) || '',
                  created_at: (payload.new.created_at as string) || '',
                  comissao_paga: (payload.new.comissao_paga as boolean) || false,
                  valor_comissao: (payload.new.valor_comissao as number) || 60.00,
                  site_status: (payload.new.site_status as string) || 'pendente'
                }
                
                setClientes(prev => 
                  prev.map(cliente => 
                    cliente.id === clienteAtualizado.id ? clienteAtualizado : cliente
                  )
                )
              }
            } else if (payload.eventType === 'DELETE') {
              console.log('🗑️ Cliente removido:', payload.old)
              if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
                setClientes(prev => 
                  prev.filter(cliente => cliente.id !== String(payload.old.id))
                )
              }
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
    }

    setupRealtime()
  }, [userEmail, selectedManager])

  const refetchWithToast = () => fetchClientes(true)

  return {
    clientes,
    loading,
    error,
    updateCliente,
    addCliente,
    refetch: refetchWithToast,
    currentManager
  }
}
