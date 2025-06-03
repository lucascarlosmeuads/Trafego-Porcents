
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export function useClienteAdd(userEmail: string, isAdmin: boolean, refetchData: () => void) {
  const addCliente = async (clienteData: any) => {
    console.log(`🚀 [useClienteAdd] === ADIÇÃO DE CLIENTE INICIADA ===`)
    console.log(`📧 User Email: ${userEmail}`)
    console.log(`🔒 Is Admin: ${isAdmin}`)
    console.log(`📊 Cliente Data:`, clienteData)

    if (!userEmail) {
      console.error('❌ [useClienteAdd] Email do usuário não fornecido')
      return { success: false, error: 'Email do usuário é obrigatório' }
    }

    if (!clienteData.email_gestor) {
      console.error('❌ [useClienteAdd] Email do gestor não fornecido')
      return { success: false, error: 'Email do gestor é obrigatório' }
    }

    try {
      // Preparar dados para inserção
      const dataToInsert = {
        nome_cliente: clienteData.nome_cliente,
        telefone: clienteData.telefone,
        email_cliente: clienteData.email_cliente,
        vendedor: clienteData.vendedor,
        email_gestor: clienteData.email_gestor,
        status_campanha: clienteData.status_campanha || 'Cliente Novo',
        data_venda: clienteData.data_venda,
        valor_comissao: clienteData.valor_comissao || 60.00,
        comissao: 'Pendente',
        site_status: 'pendente',
        site_pago: false,
        link_briefing: '',
        link_criativo: '',
        link_site: '',
        numero_bm: '',
        descricao_problema: ''
      }

      console.log('🔄 [useClienteAdd] Dados preparados para inserção:', dataToInsert)

      // Executar inserção
      const { data: insertData, error: insertError } = await supabase
        .from('todos_clientes')
        .insert([dataToInsert])
        .select()

      if (insertError) {
        console.error('❌ [useClienteAdd] ERRO NA INSERÇÃO:', insertError)
        
        // Tratamento específico de erros
        let errorMessage = 'Erro ao adicionar cliente'
        
        if (insertError.code === 'PGRST116') {
          errorMessage = 'Erro de permissão: você não tem autorização para adicionar clientes'
        } else if (insertError.code === '23505') {
          errorMessage = 'Cliente com este email já existe no sistema'
        } else if (insertError.code === '23502') {
          errorMessage = 'Dados obrigatórios em falta. Verifique todos os campos'
        } else if (insertError.message) {
          errorMessage = insertError.message
        }
        
        return { 
          success: false, 
          error: errorMessage,
          details: insertError 
        }
      }

      if (!insertData || insertData.length === 0) {
        console.error('❌ [useClienteAdd] Nenhum dado retornado após inserção')
        return { 
          success: false, 
          error: 'Nenhum registro foi criado. Verifique suas permissões.' 
        }
      }

      console.log('✅ [useClienteAdd] INSERÇÃO EXECUTADA COM SUCESSO!')
      console.log('✅ [useClienteAdd] Dados inseridos:', insertData)

      const clienteCriado = insertData[0]

      // Tentar criar usuário de autenticação se necessário
      let senhaDefinida = false
      
      try {
        console.log('🔐 [useClienteAdd] Tentando criar usuário de autenticação...')
        
        const { data: createUserResponse, error: createUserError } = await supabase.functions
          .invoke('create-client-users', {
            body: {
              clientEmail: clienteData.email_cliente,
              defaultPassword: 'parceriadesucesso'
            }
          })

        if (createUserError) {
          console.warn('⚠️ [useClienteAdd] Erro ao criar usuário de autenticação:', createUserError)
        } else {
          console.log('✅ [useClienteAdd] Usuário de autenticação criado:', createUserResponse)
          senhaDefinida = true
        }
      } catch (userCreateError) {
        console.warn('⚠️ [useClienteAdd] Falha ao criar usuário (não crítico):', userCreateError)
        // Não é crítico - o cliente foi criado com sucesso
      }

      console.log('🎉 [useClienteAdd] === PROCESSO CONCLUÍDO COM SUCESSO ===')

      // Refresh dos dados
      setTimeout(() => {
        console.log('🔄 [useClienteAdd] Executando refresh dos dados...')
        refetchData()
      }, 500)

      return {
        success: true,
        clientData: clienteCriado,
        senhaDefinida,
        message: 'Cliente adicionado com sucesso!'
      }

    } catch (err: any) {
      console.error('💥 [useClienteAdd] ERRO CRÍTICO:', err)
      
      let errorMessage = 'Erro inesperado durante a criação do cliente'
      
      if (err.message) {
        errorMessage = err.message
      }
      
      return {
        success: false,
        error: errorMessage,
        details: err
      }
    }
  }

  return { addCliente }
}
