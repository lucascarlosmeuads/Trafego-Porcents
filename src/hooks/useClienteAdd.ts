
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useClienteAdd(userEmail: string, isAdmin: boolean, refetchData: () => Promise<void>) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const addCliente = async (clienteData: any): Promise<boolean> => {
    setLoading(true)
    
    try {
      console.log('🔄 [useClienteAdd] Adicionando novo cliente:', clienteData)
      
      const { error } = await supabase
        .from('todos_clientes')
        .insert([clienteData])

      if (error) {
        console.error('❌ [useClienteAdd] Erro ao adicionar cliente:', error)
        toast({
          title: "Erro",
          description: "Falha ao adicionar cliente",
          variant: "destructive",
        })
        return false
      }

      console.log('✅ [useClienteAdd] Cliente adicionado com sucesso')
      
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso",
      })
      
      // Refetch data after successful addition
      await refetchData()
      
      return true
    } catch (error) {
      console.error('❌ [useClienteAdd] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar cliente",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    addCliente,
    loading
  }
}
