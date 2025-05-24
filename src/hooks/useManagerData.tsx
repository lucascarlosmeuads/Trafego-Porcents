
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export function useManagerData(userEmail: string, isAdmin: boolean, selectedManager?: string) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentManager, setCurrentManager] = useState<string>('')

  // Determinar o gestor baseado no email logado ou gestor selecionado (para admin)
  const determineManager = async (email: string, selectedMgr?: string): Promise<{ manager: string }> => {
    // Se for admin e tiver gestor selecionado, usar o gestor selecionado
    if (isAdmin && selectedMgr) {
      return {
        manager: selectedMgr
      }
    }
    
    if (email === 'lucas@admin.com') {
      return {
        manager: 'Lucas Falcão'
      }
    }
    
    // Buscar primeiro na tabela gestores para nomes corretos
    try {
      console.log('🔍 [useManagerData] Buscando gestor por email na tabela gestores:', email)
      
      const { data: gestorData, error: gestorError } = await supabase
        .from('gestores')
        .select('nome, email, ativo')
        .eq('email', email)
        .eq('ativo', true)
        .single()

      if (!gestorError && gestorData) {
        console.log('✅ [useManagerData] Gestor encontrado na tabela gestores:', gestorData.nome)
        return {
          manager: gestorData.nome
        }
      }
    } catch (err) {
      console.warn('[useManagerData] Gestor não encontrado na tabela gestores, usando fallback')
    }
    
    // Mapear emails específicos para gestores (fallback)
    const managerMapping: { [key: string]: { manager: string } } = {
      'andreza@gestor.com': { manager: 'Andreza' },
      'lucas.falcao@gestor.com': { manager: 'Lucas Falcão' },
      'andreza@trafegoporcents.com': { manager: 'Andreza' },
      'lucas.falcao@trafegoporcents.com': { manager: 'Lucas Falcão' },
      'carol@trafegoporcents.com': { manager: 'Carol' },
      'junior@trafegoporcents.com': { manager: 'Junior' }
    }
    
    // Se for um email específico mapeado, usar o mapeamento
    if (managerMapping[email]) {
      return {
        manager: managerMapping[email].manager
      }
    }
    
    // Se não encontrou, extrair nome do email se for @trafegoporcents.com
    if (email.endsWith('@trafegoporcents.com')) {
      const username = email.split('@')[0]
      const managerName = username.charAt(0).toUpperCase() + username.slice(1)
      return {
        manager: managerName
      }
    }
    
    return {
      manager: 'Gestor'
    }
  }

  const fetchClientes = async (showToast = false) => {
    if (!userEmail) return

    setLoading(true)
    setError(null)

    try {
      const { manager } = await determineManager(userEmail, selectedManager)
      
      setCurrentManager(manager)
      
      console.log('🔍 [useManagerData] Buscando dados da tabela todos_clientes:', { 
        userEmail, 
        manager, 
        selectedManager, 
        isAdmin 
      })
      
      // Construir query da tabela unificada todos_clientes
      let query = supabase
        .from('todos_clientes')
        .select('*', { count: 'exact' })
        .order('id', { ascending: true })

      // FILTRO CRÍTICO: Se não for admin, filtrar SEMPRE por email_gestor = email logado
      if (!isAdmin) {
        query = query.eq('email_gestor', userEmail)
        console.log('🔒 [useManagerData] APLICANDO FILTRO RLS OBRIGATÓRIO por email_gestor:', userEmail)
      } else {
        console.log('👑 [useManagerData] Admin - sem filtro de email_gestor')
      }

      const { data, error, count } = await query

      console.log('📊 [useManagerData] Resposta do Supabase (tabela todos_clientes):', {
        data: data?.length || 0,
        count,
        error,
        manager,
        filteredBy: !isAdmin ? userEmail : 'sem filtro (admin)',
        isAdmin
      })

      if (error) {
        console.error('❌ [useManagerData] Erro ao buscar clientes:', error)
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
        console.log(`✅ [useManagerData] Dados recebidos para ${manager}:`, data?.length || 0)
        
        // VALIDAÇÃO DE SEGURANÇA: Para não-admins, verificar se todos os registros têm o email correto
        if (!isAdmin && data && data.length > 0) {
          const registrosInvalidos = data.filter(item => item.email_gestor !== userEmail)
          if (registrosInvalidos.length > 0) {
            console.error('🚨 [useManagerData] ERRO DE SEGURANÇA: Registros com email_gestor incorreto detectados!', registrosInvalidos)
            setError('Erro de segurança: dados inconsistentes detectados')
            setClientes([])
            return
          }
        }
        
        const clientesFormatados = (data || []).map((item: any) => {
          if (!item.id || item.id === null || item.id === undefined) {
            console.error('⚠️ [useManagerData] Registro sem ID encontrado:', item)
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
        
        console.log(`🎯 [useManagerData] RESULTADO FINAL: ${clientesFormatados.length} clientes válidos para ${manager}`)
        
        if (clientesFormatados.length === 0 && !isAdmin) {
          console.log('ℹ️ [useManagerData] Nenhum cliente encontrado para este gestor')
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
      console.error('💥 [useManagerData] Erro na busca:', err)
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
    console.log(`🚀 [useManagerData] === INICIANDO ATUALIZAÇÃO ===`)
    console.log(`🆔 ID recebido: "${id}" (tipo: ${typeof id})`)
    console.log(`🎯 Campo: ${field}`)
    console.log(`💾 Valor: ${value}`)
    console.log(`👤 User Email: ${userEmail}`)
    console.log(`👤 Manager: ${currentManager}`)
    console.log(`🔒 IsAdmin: ${isAdmin}`)

    if (!id || id.trim() === '') {
      console.error('❌ [useManagerData] ID do cliente está vazio ou inválido:', id)
      return false
    }

    if (!userEmail) {
      console.error('❌ [useManagerData] Email do usuário não fornecido')
      return false
    }

    if (!field || field.trim() === '') {
      console.error('❌ [useManagerData] Campo está vazio ou inválido:', field)
      return false
    }

    try {
      const numericId = parseInt(id)
      
      console.log(`📋 [useManagerData] Tabela: todos_clientes`)
      console.log(`🔢 ID convertido: ${numericId} (tipo: ${typeof numericId})`)
      
      if (isNaN(numericId) || numericId <= 0) {
        console.error('❌ [useManagerData] ID inválido após conversão:', { original: id, converted: numericId })
        return false
      }

      console.log('🔍 [useManagerData] Verificando se o registro existe...')
      let checkQuery = supabase
        .from('todos_clientes')
        .select('id, status_campanha, nome_cliente, email_gestor')
        .eq('id', numericId)

      // FILTRO CRÍTICO: Se não for admin, aplicar filtro por email_gestor SEMPRE
      if (!isAdmin) {
        checkQuery = checkQuery.eq('email_gestor', userEmail)
        console.log('🔒 [useManagerData] APLICANDO FILTRO DE SEGURANÇA na verificação:', userEmail)
      }

      const { data: existingData, error: checkError } = await checkQuery.single()

      if (checkError) {
        console.error('❌ [useManagerData] Erro ao verificar existência do registro:', checkError)
        return false
      }

      if (!existingData) {
        console.error('❌ [useManagerData] Nenhum registro encontrado com ID:', numericId)
        return false
      }

      // VALIDAÇÃO DE SEGURANÇA: Para não-admins, verificar se o email_gestor confere
      if (!isAdmin && existingData.email_gestor !== userEmail) {
        console.error('🚨 [useManagerData] TENTATIVA DE ACESSO NÃO AUTORIZADO:', {
          registroEmailGestor: existingData.email_gestor,
          userEmail,
          registroId: numericId
        })
        return false
      }

      console.log('✅ [useManagerData] Registro encontrado e autorizado:', existingData)
      
      console.log('🔄 [useManagerData] Executando UPDATE...')
      let updateQuery = supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', numericId)

      // FILTRO CRÍTICO: Se não for admin, aplicar filtro por email_gestor SEMPRE
      if (!isAdmin) {
        updateQuery = updateQuery.eq('email_gestor', userEmail)
        console.log('🔒 [useManagerData] APLICANDO FILTRO DE SEGURANÇA na atualização:', userEmail)
      }

      const { data: updateData, error: updateError } = await updateQuery.select()

      if (updateError) {
        console.error('❌ [useManagerData] Erro ao atualizar cliente:', updateError)
        return false
      }

      console.log('✅ [useManagerData] Dados atualizados no Supabase:', updateData)

      setClientes(prev => 
        prev.map(cliente => 
          cliente.id === id 
            ? { ...cliente, [field]: value }
            : cliente
        )
      )

      console.log('🎉 [useManagerData] === ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===')
      return true
    } catch (err) {
      console.error('💥 [useManagerData] Erro na atualização (catch):', err)
      return false
    }
  }

  const addCliente = async (clienteData: any) => {
    if (!userEmail) {
      console.error('❌ [useManagerData] Email do usuário não fornecido')
      return false
    }

    try {
      console.log('🚀 [useManagerData] === INICIANDO ADIÇÃO DE CLIENTE ===')
      console.log('📥 Dados recebidos:', clienteData)
      console.log('👤 User Email:', userEmail)
      console.log('🔒 IsAdmin:', isAdmin)
      
      console.log(`📋 Tabela de destino: todos_clientes`)

      // Verificar o próximo ID disponível na tabela
      console.log('🔍 [useManagerData] Verificando próximo ID disponível...')
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('todos_clientes')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)

      if (maxIdError) {
        console.error('❌ [useManagerData] Erro ao verificar próximo ID:', maxIdError)
      } else {
        const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1
        console.log('🔢 [useManagerData] Próximo ID será:', nextId)
      }

      // Criar objeto limpo para inserção
      // FILTRO CRÍTICO: Para não-admins, SEMPRE usar o email do usuário logado como email_gestor
      const emailGestorFinal = isAdmin ? (clienteData.email_gestor || userEmail) : userEmail
      
      const novoCliente = {
        nome_cliente: String(clienteData.nome_cliente || ''),
        telefone: String(clienteData.telefone || ''),
        email_cliente: String(clienteData.email_cliente || ''),
        data_venda: clienteData.data_venda || null,
        vendedor: String(clienteData.vendedor || ''),
        status_campanha: String(clienteData.status_campanha || 'Preenchimento do Formulário'),
        email_gestor: String(emailGestorFinal),
        comissao_paga: false,
        valor_comissao: 60.00,
        site_status: 'pendente',
        data_limite: '',
        link_grupo: '',
        link_briefing: '',
        link_criativo: '',
        link_site: '',
        numero_bm: ''
      }

      console.log('🧹 [useManagerData] === DADOS FINAIS PARA INSERÇÃO ===')
      console.log('📊 Objeto completo:', JSON.stringify(novoCliente, null, 2))
      console.log('🔒 Email gestor final:', emailGestorFinal)

      console.log('📤 [useManagerData] Enviando para Supabase...')
      const { data, error } = await supabase
        .from('todos_clientes')
        .insert([novoCliente])
        .select()

      if (error) {
        console.error('❌ [useManagerData] === ERRO DETALHADO DO SUPABASE ===')
        console.error('🔥 Código do erro:', error.code)
        console.error('🔥 Mensagem:', error.message)
        console.error('🔥 Detalhes:', error.details)
        console.error('🔥 Hint:', error.hint)
        console.error('🔥 Objeto completo do erro:', error)
        
        toast({
          title: "Erro",
          description: `Erro ao adicionar cliente: ${error.message}`,
          variant: "destructive"
        })
        return false
      }

      console.log('✅ [useManagerData] === SUCESSO ===')
      console.log('🎉 Cliente adicionado com sucesso:', data)
      
      // Forçar atualização da tabela após inserção
      await fetchClientes()
      
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso!"
      })
      
      return true
    } catch (error) {
      console.error('💥 [useManagerData] === ERRO GERAL ===')
      console.error('💥 Erro capturado no catch:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar cliente",
        variant: "destructiva"
      })
      return false
    }
  }

  // Configurar listener de realtime para atualizações automáticas
  useEffect(() => {
    if (!userEmail) return

    const setupRealtime = async () => {
      const { manager } = await determineManager(userEmail, selectedManager)
      
      console.log('🔴 [useManagerData] Configurando realtime para tabela todos_clientes:', { userEmail, manager, selectedManager, isAdmin })

      // Buscar dados iniciais
      fetchClientes()

      // Configurar canal de realtime para a tabela unificada
      const channel = supabase
        .channel(`public:todos_clientes-${userEmail}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'todos_clientes'
          },
          (payload) => {
            console.log('🔄 [useManagerData] Mudança detectada na tabela todos_clientes:', payload)
            
            // FILTRO CRÍTICO: Se não for admin, verificar se a mudança é relevante para este gestor
            if (!isAdmin && payload.new && typeof payload.new === 'object' && 'email_gestor' in payload.new && payload.new.email_gestor !== userEmail) {
              console.log('🚫 [useManagerData] Mudança não relevante para este gestor - filtro de segurança aplicado')
              return
            }
            
            // Refresh data when changes occur
            fetchClientes()
          }
        )
        .subscribe((status) => {
          console.log(`📡 [useManagerData] Status do realtime para todos_clientes:`, status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ [useManagerData] Realtime conectado com sucesso!')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ [useManagerData] Erro no canal de realtime')
            setTimeout(() => {
              console.log('🔄 [useManagerData] Tentando reconectar realtime...')
              fetchClientes()
            }, 2000)
          }
        })

      return () => {
        console.log('🧹 [useManagerData] Removendo canal de realtime para todos_clientes')
        supabase.removeChannel(channel)
      }
    }

    setupRealtime()
  }, [userEmail, selectedManager, isAdmin])

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
