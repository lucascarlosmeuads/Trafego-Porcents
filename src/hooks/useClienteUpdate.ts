
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
      console.log('🔍 [useClienteUpdate] Verificando existência do registro...')
      let checkQuery = supabase
        .from('todos_clientes')
        .select('id, status_campanha, nome_cliente, email_gestor, site_status')
        .eq('id', numericId)

      if (!isAdmin) {
        checkQuery = checkQuery.eq('email_gestor', userEmail)
        console.log('🔒 [useClienteUpdate] Aplicando filtro de segurança:', userEmail)
      }

      const { data: existingData, error: checkError } = await checkQuery.single()

      if (checkError) {
        console.error('❌ [useClienteUpdate] Erro na verificação:', checkError)
        return false
      }

      if (!existingData) {
        console.error('❌ [useClienteUpdate] Registro não encontrado:', numericId)
        return false
      }

      console.log('✅ [useClienteUpdate] Registro encontrado:', existingData)

      if (!isAdmin && existingData.email_gestor !== userEmail) {
        console.error('🚨 [useClienteUpdate] Acesso não autorizado')
        return false
      }
      
      console.log('🔄 [useClienteUpdate] Executando UPDATE...')
      
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
      
      console.log('🎉 [useClienteUpdate] === ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===')
      
      // Refresh dos dados
      setTimeout(() => {
        console.log('🔄 [useClienteUpdate] Executando refresh...')
        refetchData()
      }, 500)
      
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
