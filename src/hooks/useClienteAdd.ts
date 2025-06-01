
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function useClienteAdd(userEmail: string, isAdmin: boolean, refetchData: () => void) {
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  const addCliente = async (clientData: any) => {
    console.log('🔵 [useClienteAdd] === INICIANDO ADIÇÃO DE CLIENTE ===')
    console.log('📧 [useClienteAdd] User Email:', userEmail)
    console.log('👤 [useClienteAdd] Is Admin:', isAdmin)
    console.log('📝 [useClienteAdd] Dados recebidos:', clientData)
    
    // ✅ GARANTIR VALOR PADRÃO R$60,00 - LOG DETALHADO
    const valorComissaoOriginal = clientData.valor_comissao
    if (!clientData.valor_comissao || clientData.valor_comissao === null || clientData.valor_comissao === undefined) {
      clientData.valor_comissao = 60.00
      console.log('💰 [useClienteAdd] VALOR PADRÃO APLICADO: R$60,00 (era:', valorComissaoOriginal, ')')
    } else {
      console.log('💰 [useClienteAdd] VALOR JÁ DEFINIDO: R$', clientData.valor_comissao)
    }

    // Garantir que comissao seja string
    if (!clientData.comissao) {
      clientData.comissao = 'Pendente'
      console.log('📊 [useClienteAdd] Status comissão definido como: Pendente')
    }

    setIsAdding(true)
    
    try {
      // Verificar se usuário está autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ [useClienteAdd] Erro ao verificar sessão:', sessionError)
        throw new Error('Erro de autenticação')
      }

      if (!session) {
        console.error('❌ [useClienteAdd] Usuário não autenticado')
        throw new Error('Usuário não está autenticado')
      }

      console.log('✅ [useClienteAdd] Usuário autenticado:', session.user.email)

      // Validações básicas
      if (!clientData.nome_cliente?.trim()) {
        throw new Error('Nome do cliente é obrigatório')
      }

      if (!clientData.telefone?.trim()) {
        throw new Error('Telefone é obrigatório') 
      }

      if (!clientData.data_venda) {
        throw new Error('Data da venda é obrigatória')
      }

      if (!clientData.status_campanha) {
        throw new Error('Status da campanha é obrigatório')
      }

      // Para não-admins, definir email_gestor automaticamente
      if (!isAdmin) {
        clientData.email_gestor = userEmail
        console.log('👨‍💼 [useClienteAdd] Email gestor definido automaticamente:', userEmail)
      }

      // Preparar dados finais com logs
      const finalData = {
        nome_cliente: clientData.nome_cliente.trim(),
        telefone: clientData.telefone.trim(),
        email_cliente: clientData.email_cliente?.trim() || '',
        data_venda: clientData.data_venda,
        vendedor: clientData.vendedor?.trim() || '',
        email_gestor: clientData.email_gestor?.trim() || userEmail,
        status_campanha: clientData.status_campanha,
        valor_comissao: clientData.valor_comissao, // ✅ R$60,00 garantido
        comissao: clientData.comissao || 'Pendente',
        site_status: 'pendente',
        site_pago: false
      }

      console.log('📤 [useClienteAdd] DADOS FINAIS PARA INSERÇÃO:', finalData)
      console.log('💰 [useClienteAdd] CONFIRMAÇÃO VALOR COMISSÃO:', finalData.valor_comissao, 'R$')

      // Inserção no banco
      const { data: insertedData, error: insertError } = await supabase
        .from('todos_clientes')
        .insert([finalData])
        .select()

      if (insertError) {
        console.error('❌ [useClienteAdd] Erro na inserção:', insertError)
        throw new Error(`Erro ao inserir cliente: ${insertError.message}`)
      }

      console.log('✅ [useClienteAdd] CLIENTE INSERIDO COM SUCESSO!')
      console.log('📊 [useClienteAdd] Dados inseridos:', insertedData)
      
      if (insertedData && insertedData[0]) {
        console.log('💰 [useClienteAdd] VALOR COMISSÃO CONFIRMADO NO BANCO:', insertedData[0].valor_comissao, 'R$')
      }

      // Criar usuário cliente se necessário
      let senhaDefinida = false
      let clientUserError = null

      if (finalData.email_cliente) {
        console.log('🔐 [useClienteAdd] Tentando criar usuário cliente:', finalData.email_cliente)
        
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: finalData.email_cliente,
            password: 'parceriadesucesso',
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                role: 'cliente'
              }
            }
          })

          if (signUpError) {
            console.log('⚠️ [useClienteAdd] Erro ao criar usuário (talvez já exista):', signUpError.message)
            clientUserError = signUpError.message
          } else {
            console.log('✅ [useClienteAdd] Usuário cliente criado com sucesso:', signUpData.user?.email)
            senhaDefinida = true
          }
        } catch (userCreationError) {
          console.error('❌ [useClienteAdd] Erro crítico na criação do usuário:', userCreationError)
          clientUserError = String(userCreationError)
        }
      }

      // Refetch data
      refetchData()

      toast({
        title: "Sucesso",
        description: `Cliente ${finalData.nome_cliente} adicionado com valor padrão R$60,00`,
        duration: 5000
      })

      return { 
        success: true, 
        clientData: insertedData[0],
        isNewClient: true,
        senhaDefinida,
        clientUserError
      }

    } catch (error: any) {
      console.error('❌ [useClienteAdd] Erro geral:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar cliente",
        variant: "destructive"
      })
      return { success: false, error: error.message }
    } finally {
      setIsAdding(false)
    }
  }

  return {
    addCliente,
    isAdding
  }
}
