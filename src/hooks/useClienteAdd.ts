
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { SENHA_PADRAO_CLIENTE } from '@/utils/clienteValidation'

export function useClienteAdd(userEmail: string, isAdmin: boolean, refetchData: () => void) {
  const addCliente = async (clienteData: any) => {
    if (!userEmail) {
      console.error('❌ [useClienteAdd] Email do usuário não fornecido')
      return { success: false, isNewClient: false, clientData: null }
    }

    try {
      console.log('🚀 [useClienteAdd] === INICIANDO ADIÇÃO DE CLIENTE ===')
      console.log('📥 Dados recebidos:', clienteData)
      console.log('👤 User Email:', userEmail)
      console.log('🔒 IsAdmin:', isAdmin)
      
      const emailGestorFinal = isAdmin ? (clienteData.email_gestor || userEmail) : userEmail
      
      // Step 1: Check if client already exists in todos_clientes
      console.log('🔍 [useClienteAdd] Verificando se cliente já existe...')
      const { data: existingCliente, error: checkError } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, valor_comissao')
        .eq('email_cliente', clienteData.email_cliente)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ [useClienteAdd] Erro ao verificar cliente existente:', checkError)
        throw new Error(`Erro ao verificar cliente: ${checkError.message}`)
      }

      let clienteJaExistia = false
      let finalClientData = clienteData
      let senhaDefinida = false

      if (existingCliente) {
        console.log('⚠️ [useClienteAdd] Cliente já existe, fazendo update dos dados...')
        console.log('💰 [useClienteAdd] Valor comissão atual:', existingCliente.valor_comissao)
        clienteJaExistia = true
        
        // Para clientes existentes, garantir que valor_comissao seja R$60 se não estiver definido
        const valorComissaoFinal = existingCliente.valor_comissao || 60.00
        
        const { data: updatedData, error: updateError } = await supabase
          .from('todos_clientes')
          .update({
            nome_cliente: String(clienteData.nome_cliente || ''),
            telefone: String(clienteData.telefone || ''),
            data_venda: clienteData.data_venda || null,
            vendedor: String(clienteData.vendedor || ''),
            status_campanha: String(clienteData.status_campanha || 'Cliente Novo'),
            email_gestor: String(emailGestorFinal),
            valor_comissao: valorComissaoFinal
          })
          .eq('id', existingCliente.id)
          .select()
          .single()

        if (updateError) {
          console.error('❌ [useClienteAdd] Erro ao atualizar cliente existente:', updateError)
          throw new Error(`Erro ao atualizar cliente: ${updateError.message}`)
        }

        finalClientData = { ...clienteData, ...updatedData }
        console.log('✅ [useClienteAdd] Cliente existente atualizado com sucesso')
        console.log('💰 [useClienteAdd] Valor comissão final:', valorComissaoFinal)
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
          valor_comissao: 60.00, // ✅ GARANTIR R$60,00 para novos clientes
          site_status: 'pendente',
          data_limite: '',
          link_grupo: '',
          link_briefing: '',
          link_criativo: '',
          link_site: '',
          numero_bm: ''
        }

        console.log('💰 [useClienteAdd] Criando novo cliente com valor_comissao: R$60,00')
        console.log('📤 [useClienteAdd] Enviando para Supabase:', novoCliente)
        
        const { data, error } = await supabase
          .from('todos_clientes')
          .insert([novoCliente])
          .select()
          .single()

        if (error) {
          console.error('❌ [useClienteAdd] Erro ao inserir cliente:', error)
          console.error('❌ [useClienteAdd] Detalhes do erro:', error.details)
          console.error('❌ [useClienteAdd] Mensagem do erro:', error.message)
          console.error('❌ [useClienteAdd] Código do erro:', error.code)
          
          // Verificar se é erro de RLS
          if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
            throw new Error('Erro de permissão: Verifique se as políticas de segurança estão configuradas corretamente.')
          }
          
          throw new Error(`Erro ao adicionar cliente: ${error.message}`)
        }

        finalClientData = { ...clienteData, ...data }
        console.log('✅ [useClienteAdd] Cliente adicionado com sucesso:', data)
        console.log('💰 [useClienteAdd] Valor comissão confirmado:', data.valor_comissao)

        // Step 3: Criar conta de usuário via Edge Function (opcional, não bloquear se falhar)
        console.log('🔐 [useClienteAdd] Tentando criar conta de usuário via Edge Function...')
        try {
          const { data: functionData, error: functionError } = await supabase.functions.invoke('create-client-users', {
            body: { 
              email_cliente: clienteData.email_cliente,
              nome_cliente: clienteData.nome_cliente,
              senha: SENHA_PADRAO_CLIENTE 
            }
          })

          if (functionError) {
            console.warn('⚠️ [useClienteAdd] Aviso na Edge Function:', functionError)
          } else {
            console.log('✅ [useClienteAdd] Conta criada via Edge Function:', functionData)
            senhaDefinida = true
          }
        } catch (edgeFunctionErr) {
          console.warn('⚠️ [useClienteAdd] Edge Function falhou (não crítico):', edgeFunctionErr)
          // Não bloquear o processo se a Edge Function falhar
        }
      }
      
      // Show success message
      if (!clienteJaExistia) {
        toast({
          title: "✅ Cliente cadastrado com sucesso!",
          description: senhaDefinida 
            ? `Cliente "${clienteData.nome_cliente}" foi adicionado à lista com valor de comissão R$60,00.\n🔐 Senha padrão definida como: ${SENHA_PADRAO_CLIENTE}`
            : `Cliente "${clienteData.nome_cliente}" foi adicionado à lista com valor de comissão R$60,00.`,
          duration: 5000
        })
      } else {
        toast({
          title: "✅ Sucesso",
          description: `Dados do cliente atualizados com sucesso! Valor de comissão: R$${finalClientData.valor_comissao || '60,00'}`
        })
      }
      
      // Refresh data
      refetchData()
      
      // SEMPRE retornar dados estruturados
      console.log('🎯 [useClienteAdd] Retornando resultado final:', {
        success: true,
        isNewClient: !clienteJaExistia,
        clientData: finalClientData,
        senhaDefinida,
        valorComissao: finalClientData.valor_comissao || 60.00
      })
      
      return { 
        success: true, 
        isNewClient: !clienteJaExistia, 
        clientData: finalClientData,
        senhaDefinida,
        valorComissao: finalClientData.valor_comissao || 60.00
      }
    } catch (error) {
      console.error('💥 [useClienteAdd] === ERRO GERAL ===')
      console.error('💥 Erro capturado no catch:', error)
      console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'N/A')
      
      toast({
        title: "❌ Erro",
        description: error instanceof Error ? error.message : "Erro inesperado ao adicionar cliente",
        variant: "destructive"
      })
      return { success: false, isNewClient: false, clientData: null, senhaDefinida: false, valorComissao: 0 }
    }
  }

  return { addCliente }
}
