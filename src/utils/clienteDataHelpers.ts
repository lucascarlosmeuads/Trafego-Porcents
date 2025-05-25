
import { supabase } from '@/lib/supabase'

export const ensureClienteExists = async (emailCliente: string, nomeCliente?: string) => {
  console.log('🔍 [ensureClienteExists] === VERIFICANDO EXISTÊNCIA DO CLIENTE ===')
  console.log('📧 [ensureClienteExists] Email:', emailCliente)
  console.log('👤 [ensureClienteExists] Nome fornecido:', nomeCliente || 'N/A')
  
  try {
    // Check if client exists
    const { data: existingCliente, error: checkError } = await supabase
      .from('todos_clientes')
      .select('id, nome_cliente, email_cliente')
      .eq('email_cliente', emailCliente)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ [ensureClienteExists] Erro ao verificar cliente:', checkError)
      return false
    }

    if (existingCliente) {
      console.log('✅ [ensureClienteExists] Cliente já existe na tabela:', existingCliente.nome_cliente)
      console.log('🆔 [ensureClienteExists] ID do cliente:', existingCliente.id)
      return true
    }

    // Client doesn't exist, create a basic record
    console.log('📝 [ensureClienteExists] Cliente não encontrado na tabela todos_clientes')
    console.log('➕ [ensureClienteExists] Criando registro básico para:', emailCliente)
    
    const { data: newCliente, error: insertError } = await supabase
      .from('todos_clientes')
      .insert([{
        email_cliente: emailCliente,
        nome_cliente: nomeCliente || 'Cliente',
        status_campanha: 'Preenchimento do Formulário',
        vendedor: '',
        email_gestor: '',
        comissao_paga: false,
        valor_comissao: 60.00,
        site_status: 'pendente',
        data_limite: '',
        link_grupo: '',
        link_briefing: '',
        link_criativo: '',
        link_site: '',
        numero_bm: '',
        telefone: '',
        data_venda: null,
        data_subida_campanha: null
      }])
      .select()

    if (insertError) {
      console.error('❌ [ensureClienteExists] Erro ao criar cliente:', insertError)
      console.error('🔥 [ensureClienteExists] Detalhes do erro:', insertError.message)
      return false
    }

    console.log('✅ [ensureClienteExists] Cliente criado com sucesso na tabela todos_clientes!')
    console.log('📊 [ensureClienteExists] Dados do novo cliente:', newCliente)
    return true

  } catch (error) {
    console.error('💥 [ensureClienteExists] Erro crítico:', error)
    return false
  }
}

export const restoreClienteData = async (emailCliente: string) => {
  console.log('🔧 [restoreClienteData] === TENTANDO RESTAURAR DADOS ===')
  console.log('📧 [restoreClienteData] Email:', emailCliente)
  
  // For the specific case of lojaofertascertas@gmail.com, restore with known data
  if (emailCliente === 'lojaofertascertas@gmail.com') {
    console.log('🎯 [restoreClienteData] Restaurando dados específicos para lojaofertascertas@gmail.com')
    
    try {
      const { data: restoredCliente, error: restoreError } = await supabase
        .from('todos_clientes')
        .insert([{
          email_cliente: 'lojaofertascertas@gmail.com',
          nome_cliente: 'Loja Ofertas Certas',
          status_campanha: 'Preenchimento do Formulário',
          vendedor: '',
          email_gestor: '',
          comissao_paga: false,
          valor_comissao: 60.00,
          site_status: 'pendente',
          data_limite: '',
          link_grupo: '',
          link_briefing: '',
          link_criativo: '',
          link_site: '',
          numero_bm: '',
          telefone: '',
          data_venda: null,
          data_subida_campanha: null
        }])
        .select()

      if (restoreError) {
        console.error('❌ [restoreClienteData] Erro ao restaurar:', restoreError)
        console.error('🔥 [restoreClienteData] Detalhes:', restoreError.message)
        return false
      }

      console.log('✅ [restoreClienteData] Dados restaurados com sucesso!')
      console.log('📊 [restoreClienteData] Cliente restaurado:', restoredCliente)
      return true

    } catch (error) {
      console.error('💥 [restoreClienteData] Erro crítico na restauração:', error)
      return false
    }
  }

  console.log('❌ [restoreClienteData] Nenhuma restauração específica configurada para este email')
  return false
}
