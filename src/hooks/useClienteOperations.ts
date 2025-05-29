
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

// Generate random password for new clients
const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Senha padrão para novos clientes
const SENHA_PADRAO_CLIENTE = 'parceriadesucesso'

// Função para verificar se o usuário é criador de sites - SIMPLIFICADA E CONFIÁVEL
const isSitesUser = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim()
  console.log('🌐 [useClienteOperations] === VERIFICAÇÃO CRIADOR DE SITES (SIMPLIFICADA) ===')
  console.log('🌐 [useClienteOperations] Email sendo verificado:', normalizedEmail)
  
  // Verificação PRIORITÁRIA e ESPECÍFICA
  const isSites = normalizedEmail === 'criadordesite@trafegoporcents.com' ||
         normalizedEmail.includes('criador') || 
         normalizedEmail.includes('site') || 
         normalizedEmail.includes('webdesign') ||
         normalizedEmail.includes('sites') ||
         normalizedEmail.includes('web') ||
         normalizedEmail.startsWith('sites') ||
         normalizedEmail.endsWith('sites.com') ||
         normalizedEmail.includes('design') ||
         normalizedEmail.includes('developer') ||
         normalizedEmail.includes('dev')
  
  console.log('🌐 [useClienteOperations] ✅ É criador de sites?', isSites)
  if (isSites) {
    console.log('🌐 [useClienteOperations] 🎯 CONFIRMADO: Usuário é criador de sites!')
    console.log('🌐 [useClienteOperations] 🔑 Email que passou no teste:', normalizedEmail)
  } else {
    console.log('🌐 [useClienteOperations] ❌ Usuário NÃO é criador de sites')
  }
  
  return isSites
}

export function useClienteOperations(userEmail: string, isAdmin: boolean, refetchData: () => void) {
  const updateCliente = async (id: string, field: string, value: string | boolean | number) => {
    console.log(`🚀 [useClienteOperations] === INICIANDO ATUALIZAÇÃO (VERSÃO CORRIGIDA) ===`)
    console.log(`🆔 ID recebido: "${id}" (tipo: ${typeof id})`)
    console.log(`🎯 Campo: ${field}`)
    console.log(`💾 Valor: ${value}`)
    console.log(`👤 User Email: ${userEmail}`)
    console.log(`🔒 IsAdmin: ${isAdmin}`)

    if (!id || id.trim() === '') {
      console.error('❌ [useClienteOperations] ID do cliente está vazio ou inválido:', id)
      return false
    }

    if (!userEmail) {
      console.error('❌ [useClienteOperations] Email do usuário não fornecido')
      return false
    }

    if (!field || field.trim() === '') {
      console.error('❌ [useClienteOperations] Campo está vazio ou inválido:', field)
      return false
    }

    try {
      const numericId = parseInt(id)
      
      console.log(`📋 [useClienteOperations] Tabela: todos_clientes`)
      console.log(`🔢 ID convertido: ${numericId} (tipo: ${typeof numericId})`)
      
      if (isNaN(numericId) || numericId <= 0) {
        console.error('❌ [useClienteOperations] ID inválido após conversão:', { original: id, converted: numericId })
        return false
      }

      // Verificar se é criador de sites - USANDO A NOVA FUNÇÃO SIMPLIFICADA
      const isSitesCreator = isSitesUser(userEmail)
      console.log(`🌐 [useClienteOperations] 🎯 É criador de sites: ${isSitesCreator}`)

      // LÓGICA SIMPLIFICADA PARA CRIADORES DE SITES
      if (isSitesCreator) {
        console.log('🌐 [useClienteOperations] === MODO CRIADOR DE SITES ===')
        console.log('🌐 [useClienteOperations] ✅ Acesso total para campos específicos')
        
        // VALIDAÇÃO DE CAMPOS PERMITIDOS para criadores de sites
        if (!['site_status', 'link_site'].includes(field)) {
          console.error('🚨 [useClienteOperations] ⛔ Criador de sites tentando editar campo não autorizado:', field)
          console.error('🚨 [useClienteOperations] ✅ Campos permitidos para criadores de sites:', ['site_status', 'link_site'])
          toast({
            title: "Erro de Permissão",
            description: `Criadores de sites só podem editar: Status do Site e Link do Site`,
            variant: "destructive",
          })
          return false
        }
        console.log('🌐 [useClienteOperations] ✅ Campo autorizado para criador de sites:', field)
        
        // PARA CRIADORES DE SITES: SEM FILTRO DE VERIFICAÇÃO PRÉVIA
        console.log('🌐 [useClienteOperations] 🚀 EXECUTANDO UPDATE DIRETO (SEM VERIFICAÇÃO PRÉVIA)')
        
        const { data: updateData, error: updateError } = await supabase
          .from('todos_clientes')
          .update({ [field]: value })
          .eq('id', numericId)
          .select()

        if (updateError) {
          console.error('❌ [useClienteOperations] ERRO NO UPDATE (CRIADOR DE SITES):', updateError)
          console.error('❌ [useClienteOperations] Detalhes completos:', {
            message: updateError.message,
            code: updateError.code,
            details: updateError.details,
            hint: updateError.hint
          })
          
          toast({
            title: "Erro na Atualização",
            description: `Falha ao atualizar ${field}: ${updateError.message}`,
            variant: "destructive",
          })
          return false
        }

        console.log('✅ [useClienteOperations] UPDATE EXECUTADO COM SUCESSO (CRIADOR DE SITES)!')
        console.log('✅ [useClienteOperations] Dados retornados:', updateData)
        console.log('✅ [useClienteOperations] Registros atualizados:', updateData?.length || 0)
        
        if (!updateData || updateData.length === 0) {
          console.error('❌ [useClienteOperations] ⚠️  NENHUM REGISTRO ATUALIZADO!')
          toast({
            title: "Erro de Atualização",
            description: "Nenhum registro foi atualizado. Pode haver uma política RLS bloqueando.",
            variant: "destructive",
          })
          return false
        }
        
        console.log('🎉 [useClienteOperations] === ATUALIZAÇÃO CONCLUÍDA COM SUCESSO (CRIADOR DE SITES) ===')
        
        // Forçar refresh dos dados com delay maior
        console.log('🔄 [useClienteOperations] Agendando refresh dos dados...')
        setTimeout(() => {
          console.log('🔄 [useClienteOperations] Executando refresh...')
          refetchData()
        }, 1000) // Aumentei o delay para 1 segundo
        
        return true
      }

      // LÓGICA PARA NÃO-CRIADORES DE SITES (Gestores, Admins, etc.)
      console.log('🔍 [useClienteOperations] Verificando se o registro existe...')
      let checkQuery = supabase
        .from('todos_clientes')
        .select('id, status_campanha, nome_cliente, email_gestor, site_status')
        .eq('id', numericId)

      // FILTRO APENAS PARA NÃO-ADMINS E NÃO-CRIADORES
      if (!isAdmin) {
        checkQuery = checkQuery.eq('email_gestor', userEmail)
        console.log('🔒 [useClienteOperations] APLICANDO FILTRO DE SEGURANÇA na verificação:', userEmail)
      }

      const { data: existingData, error: checkError } = await checkQuery.single()

      if (checkError) {
        console.error('❌ [useClienteOperations] Erro ao verificar existência do registro:', checkError)
        console.error('❌ [useClienteOperations] Detalhes do erro:', {
          message: checkError.message,
          code: checkError.code,
          details: checkError.details
        })
        return false
      }

      if (!existingData) {
        console.error('❌ [useClienteOperations] Nenhum registro encontrado com ID:', numericId)
        return false
      }

      console.log('✅ [useClienteOperations] Registro encontrado:', existingData)

      // VALIDAÇÃO DE SEGURANÇA: Para não-admins
      if (!isAdmin && existingData.email_gestor !== userEmail) {
        console.error('🚨 [useClienteOperations] TENTATIVA DE ACESSO NÃO AUTORIZADO:', {
          registroEmailGestor: existingData.email_gestor,
          userEmail,
          registroId: numericId
        })
        return false
      }
      
      console.log('🔄 [useClienteOperations] === EXECUTANDO UPDATE ===')
      console.log('🔄 [useClienteOperations] Campo:', field)
      console.log('🔄 [useClienteOperations] Valor:', value)
      console.log('🔄 [useClienteOperations] ID:', numericId)
      
      let updateQuery = supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', numericId)

      // FILTRO NO UPDATE: Para não-admins
      if (!isAdmin) {
        updateQuery = updateQuery.eq('email_gestor', userEmail)
        console.log('🔒 [useClienteOperations] APLICANDO FILTRO DE SEGURANÇA na atualização:', userEmail)
      }

      const { data: updateData, error: updateError } = await updateQuery.select()

      if (updateError) {
        console.error('❌ [useClienteOperations] ERRO NO UPDATE:', updateError)
        console.error('❌ [useClienteOperations] Detalhes completos:', {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint
        })
        
        toast({
          title: "Erro na Atualização",
          description: `Falha ao atualizar ${field}: ${updateError.message}`,
          variant: "destructive",
        })
        return false
      }

      console.log('✅ [useClienteOperations] UPDATE EXECUTADO COM SUCESSO!')
      console.log('✅ [useClienteOperations] Dados retornados:', updateData)
      console.log('✅ [useClienteOperations] Registros atualizados:', updateData?.length || 0)
      
      if (!updateData || updateData.length === 0) {
        console.error('❌ [useClienteOperations] ⚠️  NENHUM REGISTRO ATUALIZADO!')
        console.error('❌ [useClienteOperations] Possíveis causas:')
        console.error('   - Filtros de segurança bloquearam a atualização')
        console.error('   - ID não existe ou não pertence ao usuário')
        console.error('   - Erro de permissão no RLS do Supabase')
        
        toast({
          title: "Erro de Atualização",
          description: "Nenhum registro foi atualizado. Verifique suas permissões.",
          variant: "destructive",
        })
        return false
      }
      
      console.log('🎉 [useClienteOperations] === ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===')
      
      // Forçar refresh dos dados com delay maior
      console.log('🔄 [useClienteOperations] Agendando refresh dos dados...')
      setTimeout(() => {
        console.log('🔄 [useClienteOperations] Executando refresh...')
        refetchData()
      }, 1000) // Aumentei o delay para 1 segundo
      
      return true
    } catch (err) {
      console.error('💥 [useClienteOperations] ERRO CRÍTICO (catch):', err)
      toast({
        title: "Erro Crítico",
        description: "Erro inesperado durante a atualização",
        variant: "destructive",
      })
      return false
    }
  }

  const addCliente = async (clienteData: any) => {
    if (!userEmail) {
      console.error('❌ [useClienteOperations] Email do usuário não fornecido')
      return { success: false, isNewClient: false, clientData: null }
    }

    try {
      console.log('🚀 [useClienteOperations] === INICIANDO ADIÇÃO DE CLIENTE ===')
      console.log('📥 Dados recebidos:', clienteData)
      console.log('👤 User Email:', userEmail)
      console.log('🔒 IsAdmin:', isAdmin)
      
      const emailGestorFinal = isAdmin ? (clienteData.email_gestor || userEmail) : userEmail
      
      // Step 1: Check if client already exists in todos_clientes
      console.log('🔍 [useClienteOperations] Verificando se cliente já existe...')
      const { data: existingCliente, error: checkError } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente')
        .eq('email_cliente', clienteData.email_cliente)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ [useClienteOperations] Erro ao verificar cliente existente:', checkError)
        throw new Error(`Erro ao verificar cliente: ${checkError.message}`)
      }

      let clienteJaExistia = false
      let finalClientData = clienteData
      let senhaDefinida = false

      if (existingCliente) {
        console.log('⚠️ [useClienteOperations] Cliente já existe, fazendo update dos dados...')
        clienteJaExistia = true
        
        // Para clientes existentes, NÃO forçar "Cliente Novo" - manter status atual ou usar o fornecido
        const { data: updatedData, error: updateError } = await supabase
          .from('todos_clientes')
          .update({
            nome_cliente: String(clienteData.nome_cliente || ''),
            telefone: String(clienteData.telefone || ''),
            data_venda: clienteData.data_venda || null,
            vendedor: String(clienteData.vendedor || ''),
            status_campanha: String(clienteData.status_campanha || 'Cliente Novo'), // Manter o status fornecido
            email_gestor: String(emailGestorFinal)
          })
          .eq('id', existingCliente.id)
          .select()
          .single()

        if (updateError) {
          console.error('❌ [useClienteOperations] Erro ao atualizar cliente existente:', updateError)
          throw new Error(`Erro ao atualizar cliente: ${updateError.message}`)
        }

        finalClientData = { ...clienteData, ...updatedData }
        console.log('✅ [useClienteOperations] Cliente existente atualizado com sucesso')
      } else {
        // Step 2: Create new client record - SEMPRE usar "Cliente Novo" como status padrão
        const novoCliente = {
          nome_cliente: String(clienteData.nome_cliente || ''),
          telefone: String(clienteData.telefone || ''),
          email_cliente: String(clienteData.email_cliente || ''),
          data_venda: clienteData.data_venda || null,
          vendedor: String(clienteData.vendedor || ''),
          status_campanha: 'Cliente Novo', // ✅ SEMPRE "Cliente Novo" para novos clientes
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

        console.log('📤 [useClienteOperations] Enviando para Supabase...')
        const { data, error } = await supabase
          .from('todos_clientes')
          .insert([novoCliente])
          .select()
          .single()

        if (error) {
          console.error('❌ [useClienteOperations] Erro ao inserir cliente:', error)
          throw new Error(`Erro ao adicionar cliente: ${error.message}`)
        }

        finalClientData = { ...clienteData, ...data }
        console.log('✅ [useClienteOperations] Cliente adicionado com sucesso:', data)

        // Step 3: Create user account with default password for new clients
        console.log('🔐 [useClienteOperations] Criando conta de usuário com senha padrão...')
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: clienteData.email_cliente,
            password: SENHA_PADRAO_CLIENTE,
            options: {
              data: {
                full_name: clienteData.nome_cliente,
                role: 'cliente'
              }
            }
          })

          if (authError) {
            console.error('⚠️ [useClienteOperations] Erro ao criar conta de usuário:', authError)
            // Não falhar a operação se a conta já existir
            if (!authError.message.includes('already registered')) {
              console.error('❌ [useClienteOperations] Erro crítico na criação da conta:', authError)
            }
          } else {
            console.log('✅ [useClienteOperations] Conta de usuário criada com sucesso')
            senhaDefinida = true
          }
        } catch (authErr) {
          console.error('⚠️ [useClienteOperations] Erro na criação da conta (catch):', authErr)
          // Continuar mesmo se houver erro na criação da conta
        }
      }
      
      // Show success message
      if (!clienteJaExistia) {
        toast({
          title: "Cliente cadastrado com sucesso!",
          description: senhaDefinida 
            ? `Cliente "${clienteData.nome_cliente}" foi adicionado à lista.\n🔐 Senha padrão definida como: ${SENHA_PADRAO_CLIENTE}`
            : `Cliente "${clienteData.nome_cliente}" foi adicionado à lista.`,
          duration: 5000
        })
      } else {
        toast({
          title: "Sucesso",
          description: "Dados do cliente atualizados com sucesso!"
        })
      }
      
      // Refresh data
      refetchData()
      
      // SEMPRE retornar dados estruturados para garantir que o modal funcione
      console.log('🎯 [useClienteOperations] Retornando dados estruturados:', {
        success: true,
        isNewClient: !clienteJaExistia,
        clientData: finalClientData,
        senhaDefinida
      })
      
      return { 
        success: true, 
        isNewClient: !clienteJaExistia, 
        clientData: finalClientData,
        senhaDefinida
      }
    } catch (error) {
      console.error('💥 [useClienteOperations] === ERRO GERAL ===')
      console.error('💥 Erro capturado no catch:', error)
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro inesperado ao adicionar cliente",
        variant: "destructive"
      })
      return { success: false, isNewClient: false, clientData: null, senhaDefinida: false }
    }
  }

  return {
    updateCliente,
    addCliente
  }
}
