
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useClienteUpdate(userEmail: string, isAdmin: boolean, refetchData: () => Promise<void>) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const updateCliente = async (clienteId: string, field: string, value: any): Promise<boolean> => {
    if (!clienteId || clienteId.trim() === '') {
      console.error('❌ [useClienteUpdate] ID do cliente inválido:', clienteId)
      return false
    }

    setLoading(true)
    
    try {
      console.log(`🔄 [useClienteUpdate] Atualizando cliente ${clienteId}, campo: ${field}, valor:`, value)
      
      const { error } = await supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', parseInt(clienteId))

      if (error) {
        console.error('❌ [useClienteUpdate] Erro ao atualizar cliente:', error)
        toast({
          title: "Erro",
          description: "Falha ao atualizar cliente",
          variant: "destructive",
        })
        return false
      }

      console.log('✅ [useClienteUpdate] Cliente atualizado com sucesso')
      
      // Refetch data after successful update
      await refetchData()
      
      return true
    } catch (error) {
      console.error('❌ [useClienteUpdate] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar cliente",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    updateCliente,
    loading
  }
}
