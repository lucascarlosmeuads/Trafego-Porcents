
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface AddClienteResult {
  success: boolean
  error?: string
  clientData?: any
  senhaDefinida?: boolean
}

export function useClienteAdd(userEmail: string, isAdmin: boolean, refetchData: () => Promise<void>) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const addCliente = async (clienteData: any): Promise<AddClienteResult> => {
    setLoading(true)
    
    try {
      console.log('🔄 [useClienteAdd] Adicionando novo cliente:', clienteData)
      
      const { data, error } = await supabase
        .from('todos_clientes')
        .insert([clienteData])
        .select()

      if (error) {
        console.error('❌ [useClienteAdd] Erro ao adicionar cliente:', error)
        toast({
          title: "Erro",
          description: "Falha ao adicionar cliente",
          variant: "destructive",
        })
        return {
          success: false,
          error: error.message
        }
      }

      console.log('✅ [useClienteAdd] Cliente adicionado com sucesso')
      
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso",
      })
      
      // Refetch data after successful addition
      await refetchData()
      
      return {
        success: true,
        clientData: data?.[0],
        senhaDefinida: true
      }
    } catch (error: any) {
      console.error('❌ [useClienteAdd] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar cliente",
        variant: "destructive",
      })
      return {
        success: false,
        error: error.message || 'Erro inesperado'
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    addCliente,
    loading
  }
}
