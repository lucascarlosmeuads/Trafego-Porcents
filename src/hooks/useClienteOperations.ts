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

// Função para verificar se o usuário é criador de sites - OTIMIZADA
const isSitesUser = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim()
  console.log('🌐 [useClienteOperations] Verificando criador de sites:', normalizedEmail)
  
  const isSites = normalizedEmail === 'criadordesite@trafegoporcents.com' ||
         normalizedEmail.includes('criador') || 
         normalizedEmail.includes('site') || 
         normalizedEmail.includes('webdesign') ||
         normalizedEmail.includes('sites') ||
         normalizedEmail.includes('web') ||
         normalizedEmail.includes('design') ||
         normalizedEmail.includes('developer') ||
         normalizedEmail.includes('dev')
  
  console.log('🌐 [useClienteOperations] É criador de sites:', isSites)
  return isSites
}

export function useClienteOperations(userEmail: string, isAdmin: boolean, refetchData: () => void) {
  const updateCliente = async (id: string, field: string, value: string | boolean | number) => {
    console.log(`🚀 [useClienteOperations] === ATUALIZAÇÃO INICIADA ===`)
    console.log(`🆔 ID: ${id} | Campo: ${field} | Valor: ${value}`)
    console.log(`👤 Email: ${userEmail} | Admin: ${isAdmin}`)

    if (!id || id.trim() === '') {
      console.error('❌ [useClienteOperations] ID inválido:', id)
      return false
    }

    if (!userEmail || !field) {
      console.error('❌ [useClienteOperations] Parâmetros obrigatórios em falta')
      return false
    }

    try {
      const numericId = parseInt(id)
      
      if (isNaN(numericId) || numericId <= 0) {
        console.error('❌ [useClienteOperations] ID inválido após conversão:', { original: id, converted: numericId })
        return false
      }

      // Verificar se é criador de sites
      const isSitesCreator = isSitesUser(userEmail)
      console.log(`🌐 [useClienteOperations] É criador de sites: ${isSitesCreator}`)

      // LÓGICA PARA CRIADORES DE SITES
      if (isSitesCreator) {
        console.log('🌐 [useClienteOperations] === MODO CRIADOR DE SITES ===')
        
        // Validar campos permitidos para criadores de sites
        if (!['site_status', 'link_site'].includes(field)) {
          console.error('🚨 [useClienteOperations] Campo não autorizado para criador de sites:', field)
          toast({
            title: "Erro de Permissão",
            description: `Criadores de sites só podem editar: Status do Site e Link do Site`,
            variant: "destructive",
          })
          return false
        }
        
        console.log('🌐 [useClienteOperations] ✅ Campo autorizado, executando update...')
        
        // UPDATE DIRETO para criadores de sites (agora com RLS adequada)
        const { data: updateData, error: updateError } = await supabase
          .from('todos_clientes')
          .update({ [field]: value })
          .eq('id', numericId)
          .select()

        if (updateError) {
          console.error('❌ [useClienteOperations] ERRO NO UPDATE:', updateError)
          toast({
            title: "Erro na Atualização",
            description: `Falha ao atualizar ${field}: ${updateError.message}`,
            variant: "destructive",
          })
          return false
        }

        console.log('✅ [useClienteOperations] UPDATE EXECUTADO COM SUCESSO!')
        console.log('✅ [useClienteOperations] Registros atualizados:', updateData?.length || 0)
        
        if (!updateData || updateData.length === 0) {
          console.error('❌ [useClienteOperations] Nenhum registro foi atualizado')
          toast({
            title: "Erro de Atualização",
            description: "Nenhum registro foi atualizado. Verifique suas permissões.",
            variant: "destructive",
          })
          return false
        }
        
        console.log('🎉 [useClienteOperations] === SUCESSO CRIADOR DE SITES ===')
        
        // Toast de sucesso para criadores de sites
        toast({
          title: "Sucesso!",
          description: `${field === 'site_status' ? 'Status do site' : 'Link do site'} atualizado com sucesso!`,
        })
        
        // Refresh com delay otimizado
        setTimeout(() => {
          console.log('🔄 [useClienteOperations] Executando refresh...')
          refetchData()
        }, 500)
        
        return true
      }

      // LÓGICA PARA GESTORES/ADMINS (código existente)
      console.log('🔍 [useClienteOperations] Verificando existência do registro...')
      let checkQuery = supabase
        .from('todos_clientes')
        .select('id, status_campanha, nome_cliente, email_gestor, site_status')
        .eq('id', numericId)

      if (!isAdmin) {
        checkQuery = checkQuery.eq('email_gestor', userEmail)
        console.log('🔒 [useClienteOperations] Aplicando filtro de segurança:', userEmail)
      }

      const { data: existingData, error: checkError } = await checkQuery.single()

      if (checkError) {
        console.error('❌ [useClienteOperations] Erro na verificação:', checkError)
        return false
      }

      if (!existingData) {
        console.error('❌ [useClienteOperations] Registro não encontrado:', numericId)
        return false
      }

      console.log('✅ [useClienteOperations] Registro encontrado:', existingData)

      if (!isAdmin && existingData.email_gestor !== userEmail) {
        console.error('🚨 [useClienteOperations] Acesso não autorizado')
        return false
      }
      
      console.log('🔄 [useClienteOperations] Executando UPDATE...')
      
      let updateQuery = supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', numericId)

      if (!isAdmin) {
        updateQuery = updateQuery.eq('email_gestor', userEmail)
      }

      const { data: updateData, error: updateError } = await updateQuery.select()

      if (updateError) {
        console.error('❌ [useClienteOperations] ERRO NO UPDATE:', updateError)
        toast({
          title: "Erro na Atualização",
          description: `Falha ao atualizar ${field}: ${updateError.message}`,
          variant: "destructive",
        })
        return false
      }

      console.log('✅ [useClienteOperations] UPDATE EXECUTADO COM SUCESSO!')
      console.log('✅ [useClienteOperations] Dados retornados:', updateData)
      
      if (!updateData || updateData.length === 0) {
        console.error('❌ [useClienteOperations] Nenhum registro atualizado')
        toast({
          title: "Erro de Atualização",
          description: "Nenhum registro foi atualizado. Verifique suas permissões.",
          variant: "destructive",
        })
        return false
      }
      
      console.log('🎉 [useClienteOperations] === ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===')
      
      // Refresh dos dados
      setTimeout(() => {
        console.log('🔄 [useClienteOperations] Executando refresh...')
        refetchData()
      }, 500)
      
      return true
    } catch (err) {
      console.error('💥 [useClienteOperations] ERRO CRÍTICO:', err)
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

        // Step 3: ✅ NOVA IMPLEMENTAÇÃO - Usar Edge Function para criar conta sem redirecionamento
        console.log('🔐 [useClienteOperations] Criando conta de usuário via Edge Function...')
        try {
          const { data: functionData, error: functionError } = await supabase.functions.invoke('create-client-users', {
            body: { 
              email_cliente: clienteData.email_cliente,
              nome_cliente: clienteData.nome_cliente,
              senha: SENHA_PADRAO_CLIENTE 
            }
          })

          if (functionError) {
            console.error('⚠️ [useClienteOperations] Erro na Edge Function:', functionError)
          } else {
            console.log('✅ [useClienteOperations] Conta criada via Edge Function:', functionData)
            senhaDefinida = true
          }
        } catch (edgeFunctionErr) {
          console.error('⚠️ [useClienteOperations] Erro na Edge Function (catch):', edgeFunctionErr)
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
