
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useSaqueOperations() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const atualizarComissao = async (
    clienteId: string | number,
    novoStatusComissao: string
  ) => {
    console.log('🚀 [useSaqueOperations] Atualizando comissão:', {
      clienteId,
      novoStatusComissao
    })

    setLoading(true)
    
    try {
      // Atualizar apenas a coluna comissao na tabela todos_clientes
      const { error } = await supabase
        .from('todos_clientes')
        .update({ 
          comissao: novoStatusComissao
        })
        .eq('id', Number(clienteId))

      if (error) {
        console.error('❌ [useSaqueOperations] Erro ao atualizar comissão:', error)
        throw error
      }

      console.log('✅ [useSaqueOperations] Comissão atualizada com sucesso')

      toast({
        title: "Comissão atualizada!",
        description: `Status alterado para: ${novoStatusComissao}`,
      })

      return true

    } catch (error) {
      console.error('💥 [useSaqueOperations] Erro geral:', error)
      toast({
        title: "Erro ao atualizar comissão",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    atualizarComissao,
    loading
  }
}
