
import { supabase } from '@/lib/supabase'
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
        .select('id, nome_cliente')
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
          console.error('❌ [useClienteAdd] Erro ao atualizar cliente existente:', updateError)
          throw new Error(`Erro ao atualizar cliente: ${updateError.message}`)
        }

        finalClientData = { ...clienteData, ...updatedData }
        console.log('✅ [useClienteAdd] Cliente existente atualizado com sucesso')
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

        console.log('📤 [useClienteAdd] Enviando para Supabase...')
        const { data, error } = await supabase
          .from('todos_clientes')
          .insert([novoCliente])
          .select()
          .single()

        if (error) {
          console.error('❌ [useClienteAdd] Erro ao inserir cliente:', error)
          throw new Error(`Erro ao adicionar cliente: ${error.message}`)
        }

        finalClientData = { ...clienteData, ...data }
        console.log('✅ [useClienteAdd] Cliente adicionado com sucesso:', data)

        // Step 3: ✅ NOVA IMPLEMENTAÇÃO - Usar Edge Function para criar conta sem redirecionamento
        console.log('🔐 [useClienteAdd] Criando conta de usuário via Edge Function...')
        try {
          const { data: functionData, error: functionError } = await supabase.functions.invoke('create-client-users', {
            body: { 
              email_cliente: clienteData.email_cliente,
              nome_cliente: clienteData.nome_cliente,
              senha: SENHA_PADRAO_CLIENTE 
            }
          })

          if (functionError) {
            console.error('⚠️ [useClienteAdd] Erro na Edge Function:', functionError)
          } else {
            console.log('✅ [useClienteAdd] Conta criada via Edge Function:', functionData)
            senhaDefinida = true
          }
        } catch (edgeFunctionErr) {
          console.error('⚠️ [useClienteAdd] Erro na Edge Function (catch):', edgeFunctionErr)
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
      console.log('🎯 [useClienteAdd] Retornando dados estruturados:', {
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
      console.error('💥 [useClienteAdd] === ERRO GERAL ===')
      console.error('💥 Erro capturado no catch:', error)
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro inesperado ao adicionar cliente",
        variant: "destructive"
      })
      return { success: false, isNewClient: false, clientData: null, senhaDefinida: false }
    }
  }

  return { addCliente }
}
