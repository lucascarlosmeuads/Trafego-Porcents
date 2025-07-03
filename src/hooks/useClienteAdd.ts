
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface AddClienteResult {
  success: boolean
  error?: string
  clientData?: any
  senhaDefinida?: boolean
}

interface ClienteData {
  nome_cliente: string
  telefone: string
  email_cliente: string
  vendedor?: string
  email_gestor: string
  status_campanha: string
  data_venda: string
  valor_comissao: number
  comissao_paga: boolean
  data_cadastro_desejada?: string
  origem_cadastro?: 'venda' | 'admin'
  valor_venda_inicial?: number
}

export function useClienteAdd(userEmail: string, isAdmin: boolean, refetchData: () => Promise<void>) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const addCliente = async (clienteData: ClienteData): Promise<AddClienteResult> => {
    setLoading(true)
    
    try {
      console.log('🔄 [useClienteAdd] Adicionando novo cliente:', clienteData)
      
      // Preparar dados para inserção
      const insertData = {
        ...clienteData,
        origem_cadastro: clienteData.origem_cadastro || 'venda',
        data_cadastro_desejada: clienteData.data_cadastro_desejada ? 
          new Date(clienteData.data_cadastro_desejada).toISOString() : null
      }
      
      const { data, error } = await supabase
        .from('todos_clientes')
        .insert([insertData])
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
      
      const origemTexto = clienteData.origem_cadastro === 'admin' ? 'cliente antigo' : 'nova venda'
      
      toast({
        title: "Sucesso",
        description: `Cliente adicionado como ${origemTexto}`,
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
