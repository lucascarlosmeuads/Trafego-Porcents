
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { isSitesUser } from '@/utils/clienteValidation'

export function useClienteUpdate(userEmail: string, isAdmin: boolean, refetchData: () => void) {
  const updateCliente = async (id: string, field: string, value: string | boolean | number) => {
    console.log(`🚀 [useClienteUpdate] === ATUALIZAÇÃO INICIADA ===`)
    console.log(`🆔 ID: ${id} | Campo: ${field} | Valor: ${value}`)
    console.log(`👤 Email: ${userEmail} | Admin: ${isAdmin}`)

    if (!id || id.trim() === '') {
      console.error('❌ [useClienteUpdate] ID inválido:', id)
      return false
    }

    if (!userEmail || !field) {
      console.error('❌ [useClienteUpdate] Parâmetros obrigatórios em falta')
      return false
    }

    try {
      const numericId = parseInt(id)
      
      if (isNaN(numericId) || numericId <= 0) {
        console.error('❌ [useClienteUpdate] ID inválido após conversão:', { original: id, converted: numericId })
        return false
      }

      // VALIDAÇÃO CRÍTICA: Buscar o cliente ANTES da atualização para garantir consistência
      console.log('🔍 [useClienteUpdate] Buscando cliente para validação...')
      const { data: clienteAtual, error: fetchError } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, email_cliente, comissao, valor_comissao, email_gestor')
        .eq('id', numericId)
        .single()

      if (fetchError || !clienteAtual) {
        console.error('❌ [useClienteUpdate] Cliente não encontrado na base:', { numericId, fetchError })
        toast({
          title: "Erro",
          description: "Cliente não encontrado na base de dados",
          variant: "destructive",
        })
        return false
      }

      console.log('✅ [useClienteUpdate] Cliente encontrado:', {
        id: clienteAtual.id,
        nome: clienteAtual.nome_cliente,
        email: clienteAtual.email_cliente,
        comissaoAtual: clienteAtual.comissao,
        valorComissaoAtual: clienteAtual.valor_comissao
      })

      // Verificar se é criador de sites
      const isSitesCreator = isSitesUser(userEmail)
      console.log(`🌐 [useClienteUpdate] É criador de sites: ${isSitesCreator}`)

      // LÓGICA PARA CRIADORES DE SITES
      if (isSitesCreator) {
        console.log('🌐 [useClienteUpdate] === MODO CRIADOR DE SITES ===')
        
        // Validar campos permitidos para criadores de sites
        if (!['site_status', 'link_site'].includes(field)) {
          console.error('🚨 [useClienteUpdate] Campo não autorizado para criador de sites:', field)
          toast({
            title: "Erro de Permissão",
            description: `Criadores de sites só podem editar: Status do Site e Link do Site`,
            variant: "destructive",
          })
          return false
        }
        
        console.log('🌐 [useClienteUpdate] ✅ Campo autorizado, executando update...')
        
        // UPDATE DIRETO para criadores de sites (agora com RLS adequada)
        const { data: updateData, error: updateError } = await supabase
          .from('todos_clientes')
          .update({ [field]: value })
          .eq('id', numericId)
          .select()

        if (updateError) {
          console.error('❌ [useClienteUpdate] ERRO NO UPDATE:', updateError)
          toast({
            title: "Erro na Atualização",
            description: `Falha ao atualizar ${field}: ${updateError.message}`,
            variant: "destructive",
          })
          return false
        }

        console.log('✅ [useClienteUpdate] UPDATE EXECUTADO COM SUCESSO!')
        console.log('✅ [useClienteUpdate] Registros atualizados:', updateData?.length || 0)
        
        if (!updateData || updateData.length === 0) {
          console.error('❌ [useClienteUpdate] Nenhum registro foi atualizado')
          toast({
            title: "Erro de Atualização",
            description: "Nenhum registro foi atualizado. Verifique suas permissões.",
            variant: "destructive",
          })
          return false
        }
        
        console.log('🎉 [useClienteUpdate] === SUCESSO CRIADOR DE SITES ===')
        
        // Toast de sucesso para criadores de sites
        toast({
          title: "Sucesso!",
          description: `${field === 'site_status' ? 'Status do site' : 'Link do site'} atualizado com sucesso!`,
        })
        
        // Refresh com delay otimizado
        setTimeout(() => {
          console.log('🔄 [useClienteUpdate] Executando refresh...')
          refetchData()
        }, 500)
        
        return true
      }

      // LÓGICA PARA GESTORES/ADMINS (código existente)
      console.log('🔍 [useClienteUpdate] Verificando permissões de gestor/admin...')
      
      // Verificar permissões do gestor (se não for admin)
      if (!isAdmin && clienteAtual.email_gestor !== userEmail) {
        console.error('🚨 [useClienteUpdate] Acesso não autorizado - gestor não corresponde')
        toast({
          title: "Erro de Permissão",
          description: "Você não tem permissão para editar este cliente",
          variant: "destructive",
        })
        return false
      }
      
      console.log('🔄 [useClienteUpdate] Executando UPDATE...')
      
      // LOG DETALHADO ANTES DA ATUALIZAÇÃO
      console.log('📋 [useClienteUpdate] Dados da atualização:', {
        id: numericId,
        campo: field,
        valorAntigo: clienteAtual[field],
        valorNovo: value,
        clienteNome: clienteAtual.nome_cliente,
        timestamp: new Date().toISOString()
      })

      // EXECUTAR UPDATE COM VALIDAÇÃO ADICIONAL
      let updateQuery = supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', numericId)

      if (!isAdmin) {
        updateQuery = updateQuery.eq('email_gestor', userEmail)
      }

      const { data: updateData, error: updateError } = await updateQuery.select()

      if (updateError) {
        console.error('❌ [useClienteUpdate] ERRO NO UPDATE:', updateError)
        toast({
          title: "Erro na Atualização",
          description: `Falha ao atualizar ${field}: ${updateError.message}`,
          variant: "destructive",
        })
        return false
      }

      console.log('✅ [useClienteUpdate] UPDATE EXECUTADO COM SUCESSO!')
      console.log('✅ [useClienteUpdate] Dados retornados:', updateData)
      
      if (!updateData || updateData.length === 0) {
        console.error('❌ [useClienteUpdate] Nenhum registro atualizado')
        toast({
          title: "Erro de Atualização",
          description: "Nenhum registro foi atualizado. Verifique suas permissões.",
          variant: "destructive",
        })
        return false
      }

      // VALIDAÇÃO PÓS-UPDATE
      const updatedRecord = updateData[0]
      console.log('🔍 [useClienteUpdate] Validação pós-update:', {
        recordId: updatedRecord.id,
        recordNome: updatedRecord.nome_cliente,
        campoAtualizado: field,
        valorAtualizado: updatedRecord[field],
        valorEsperado: value,
        updateCorreu: updatedRecord[field] === value
      })

      if (updatedRecord[field] !== value) {
        console.warn('⚠️ [useClienteUpdate] Valor atualizado não corresponde ao esperado!')
      }
      
      console.log('🎉 [useClienteUpdate] === ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===')
      
      // Refresh dos dados com delay menor para melhor UX
      setTimeout(() => {
        console.log('🔄 [useClienteUpdate] Executando refresh...')
        refetchData()
      }, 300)
      
      return true
    } catch (err) {
      console.error('💥 [useClienteUpdate] ERRO CRÍTICO:', err)
      toast({
        title: "Erro Crítico",
        description: "Erro inesperado durante a atualização",
        variant: "destructive",
      })
      return false
    }
  }

  return { updateCliente }
}
