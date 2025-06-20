
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useCampanhaOperations() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const salvarLinkCampanha = async (clienteId: string, linkCampanha: string): Promise<boolean> => {
    setLoading(true)
    
    try {
      console.log('🔄 [useCampanhaOperations] Salvando link da campanha:', { clienteId, linkCampanha })

      const { error } = await supabase
        .from('todos_clientes')
        .update({ link_campanha: linkCampanha })
        .eq('id', clienteId)

      if (error) {
        console.error('❌ [useCampanhaOperations] Erro ao salvar link:', error)
        throw error
      }

      console.log('✅ [useCampanhaOperations] Link da campanha salvo com sucesso')
      return true

    } catch (error) {
      console.error('💥 [useCampanhaOperations] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro ao salvar o link da campanha",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const buscarCampanhasPorGestor = async (emailGestor: string) => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, email_cliente, link_campanha')
        .eq('email_gestor', emailGestor)
        .not('link_campanha', 'is', null)
        .order('nome_cliente')

      if (error) {
        console.error('❌ [useCampanhaOperations] Erro ao buscar campanhas:', error)
        throw error
      }

      return data || []

    } catch (error) {
      console.error('💥 [useCampanhaOperations] Erro inesperado:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    salvarLinkCampanha,
    buscarCampanhasPorGestor,
    loading
  }
}
