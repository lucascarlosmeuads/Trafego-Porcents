
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

      // Verificar o próximo ID disponível na tabela
      console.log('🔍 [useClienteOperations] Verificando próximo ID disponível...')
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('todos_clientes')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)

      if (maxIdError) {
        console.error('❌ [useClienteOperations] Erro ao verificar próximo ID:', maxIdError)
      } else {
        const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1
        console.log('🔢 [useClienteOperations] Próximo ID será:', nextId)
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
        
        toast({
          title: "Erro",
          description: `Erro ao adicionar cliente: ${error.message}`,
          variant: "destructive"
        })
        return false
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
        description: "Erro inesperado ao adicionar cliente",
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
