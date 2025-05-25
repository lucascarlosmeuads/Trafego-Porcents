
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export function useClienteOperations(userEmail: string, isAdmin: boolean, refetchData: () => void) {
  const updateCliente = async (id: string, field: string, value: string | boolean | number) => {
    console.log(`🚀 [useClienteOperations] === INICIANDO ATUALIZAÇÃO ===`)
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

      console.log('🔍 [useClienteOperations] Verificando se o registro existe...')
      let checkQuery = supabase
        .from('todos_clientes')
        .select('id, status_campanha, nome_cliente, email_gestor')
        .eq('id', numericId)

      // FILTRO CRÍTICO: Se não for admin, aplicar filtro por email_gestor SEMPRE
      if (!isAdmin) {
        checkQuery = checkQuery.eq('email_gestor', userEmail)
        console.log('🔒 [useClienteOperations] APLICANDO FILTRO DE SEGURANÇA na verificação:', userEmail)
      }

      const { data: existingData, error: checkError } = await checkQuery.single()

      if (checkError) {
        console.error('❌ [useClienteOperations] Erro ao verificar existência do registro:', checkError)
        return false
      }

      if (!existingData) {
        console.error('❌ [useClienteOperations] Nenhum registro encontrado com ID:', numericId)
        return false
      }

      // VALIDAÇÃO DE SEGURANÇA: Para não-admins, verificar se o email_gestor confere
      if (!isAdmin && existingData.email_gestor !== userEmail) {
        console.error('🚨 [useClienteOperations] TENTATIVA DE ACESSO NÃO AUTORIZADO:', {
          registroEmailGestor: existingData.email_gestor,
          userEmail,
          registroId: numericId
        })
        return false
      }

      console.log('✅ [useClienteOperations] Registro encontrado e autorizado:', existingData)
      
      console.log('🔄 [useClienteOperations] Executando UPDATE...')
      let updateQuery = supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', numericId)

      // FILTRO CRÍTICO: Se não for admin, aplicar filtro por email_gestor SEMPRE
      if (!isAdmin) {
        updateQuery = updateQuery.eq('email_gestor', userEmail)
        console.log('🔒 [useClienteOperations] APLICANDO FILTRO DE SEGURANÇA na atualização:', userEmail)
      }

      const { data: updateData, error: updateError } = await updateQuery.select()

      if (updateError) {
        console.error('❌ [useClienteOperations] Erro ao atualizar cliente:', updateError)
        return false
      }

      console.log('✅ [useClienteOperations] Dados atualizados no Supabase:', updateData)
      console.log('🎉 [useClienteOperations] === ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===')
      return true
    } catch (err) {
      console.error('💥 [useClienteOperations] Erro na atualização (catch):', err)
      return false
    }
  }

  const addCliente = async (clienteData: any) => {
    if (!userEmail) {
      console.error('❌ [useClienteOperations] Email do usuário não fornecido')
      return false
    }

    try {
      console.log('🚀 [useClienteOperations] === INICIANDO ADIÇÃO DE CLIENTE ===')
      console.log('📥 Dados recebidos:', clienteData)
      console.log('👤 User Email:', userEmail)
      console.log('🔒 IsAdmin:', isAdmin)
      
      console.log(`📋 Tabela de destino: todos_clientes`)

      // FILTRO CRÍTICO: Para não-admins, SEMPRE usar o email do usuário logado como email_gestor
      const emailGestorFinal = isAdmin ? (clienteData.email_gestor || userEmail) : userEmail
      
      // Verificar se já existe um cliente com o mesmo email
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

      if (existingCliente) {
        console.log('⚠️ [useClienteOperations] Cliente já existe, fazendo update dos dados...')
        
        // Fazer update dos dados existentes
        const { error: updateError } = await supabase
          .from('todos_clientes')
          .update({
            nome_cliente: String(clienteData.nome_cliente || ''),
            telefone: String(clienteData.telefone || ''),
            data_venda: clienteData.data_venda || null,
            vendedor: String(clienteData.vendedor || ''),
            status_campanha: String(clienteData.status_campanha || 'Preenchimento do Formulário'),
            email_gestor: String(emailGestorFinal)
          })
          .eq('id', existingCliente.id)

        if (updateError) {
          console.error('❌ [useClienteOperations] Erro ao atualizar cliente existente:', updateError)
          throw new Error(`Erro ao atualizar cliente: ${updateError.message}`)
        }

        console.log('✅ [useClienteOperations] Cliente existente atualizado com sucesso')
        
        // Forçar atualização da tabela após update
        refetchData()
        
        toast({
          title: "Sucesso",
          description: "Dados do cliente atualizados com sucesso!"
        })
        
        return true
      }

      // Cliente não existe, criar novo
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

      console.log('🧹 [useClienteOperations] === DADOS FINAIS PARA INSERÇÃO ===')
      console.log('📊 Objeto completo:', JSON.stringify(novoCliente, null, 2))
      console.log('🔒 Email gestor final:', emailGestorFinal)

      console.log('📤 [useClienteOperations] Enviando para Supabase...')
      const { data, error } = await supabase
        .from('todos_clientes')
        .insert([novoCliente])
        .select()

      if (error) {
        console.error('❌ [useClienteOperations] === ERRO DETALHADO DO SUPABASE ===')
        console.error('🔥 Código do erro:', error.code)
        console.error('🔥 Mensagem:', error.message)
        console.error('🔥 Detalhes:', error.details)
        console.error('🔥 Hint:', error.hint)
        console.error('🔥 Objeto completo do erro:', error)
        
        throw new Error(`Erro ao adicionar cliente: ${error.message}`)
      }

      console.log('✅ [useClienteOperations] === SUCESSO ===')
      console.log('🎉 Cliente adicionado com sucesso:', data)
      
      // Forçar atualização da tabela após inserção
      refetchData()
      
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso!"
      })
      
      return true
    } catch (error) {
      console.error('💥 [useClienteOperations] === ERRO GERAL ===')
      console.error('💥 Erro capturado no catch:', error)
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro inesperado ao adicionar cliente",
        variant: "destructive"
      })
      return false
    }
  }

  return {
    updateCliente,
    addCliente
  }
}
