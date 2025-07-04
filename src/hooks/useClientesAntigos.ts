
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface ClienteAntigo {
  id: string
  nome_cliente: string
  email_cliente: string
  telefone: string
  vendedor: string
  email_gestor: string
  data_venda: string
  valor_comissao: number
  comissao: string
  site_status: string
  site_pago: boolean
  descricao_problema?: string
  link_briefing?: string
  link_criativo?: string
  link_site?: string
  numero_bm?: string
  created_at: string
  updated_at: string
}

export function useClientesAntigos() {
  const [clientesAntigos, setClientesAntigos] = useState<ClienteAntigo[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchClientesAntigos = async () => {
    try {
      setLoading(true)
      console.log('🔍 [useClientesAntigos] Buscando clientes antigos...')
      
      const { data, error } = await supabase
        .from('clientes_antigos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useClientesAntigos] Erro ao buscar clientes antigos:', error)
        toast({
          title: "Erro",
          description: "Erro ao carregar clientes antigos",
          variant: "destructive"
        })
        return
      }

      console.log('✅ [useClientesAntigos] Clientes antigos carregados:', data?.length || 0)
      setClientesAntigos(data || [])
    } catch (error) {
      console.error('❌ [useClientesAntigos] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addClienteAntigo = async (clienteData: Omit<ClienteAntigo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🔄 [useClientesAntigos] Adicionando cliente antigo:', clienteData)
      
      const { data, error } = await supabase
        .from('clientes_antigos')
        .insert([clienteData])
        .select()

      if (error) {
        console.error('❌ [useClientesAntigos] Erro ao adicionar cliente antigo:', error)
        toast({
          title: "Erro",
          description: "Erro ao adicionar cliente antigo",
          variant: "destructive"
        })
        return false
      }

      console.log('✅ [useClientesAntigos] Cliente antigo adicionado com sucesso')
      toast({
        title: "Sucesso",
        description: "Cliente antigo adicionado com sucesso"
      })
      
      // Atualizar a lista
      await fetchClientesAntigos()
      return true
    } catch (error) {
      console.error('❌ [useClientesAntigos] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar cliente",
        variant: "destructive"
      })
      return false
    }
  }

  const updateClienteAntigo = async (id: string, updates: Partial<ClienteAntigo>) => {
    try {
      console.log('🔄 [useClientesAntigos] Atualizando cliente antigo:', id, updates)
      
      const { error } = await supabase
        .from('clientes_antigos')
        .update(updates)
        .eq('id', id)

      if (error) {
        console.error('❌ [useClientesAntigos] Erro ao atualizar cliente antigo:', error)
        toast({
          title: "Erro",
          description: "Erro ao atualizar cliente antigo",
          variant: "destructive"
        })
        return false
      }

      console.log('✅ [useClientesAntigos] Cliente antigo atualizado com sucesso')
      toast({
        title: "Sucesso",
        description: "Cliente antigo atualizado com sucesso"
      })
      
      // Atualizar a lista
      await fetchClientesAntigos()
      return true
    } catch (error) {
      console.error('❌ [useClientesAntigos] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar cliente",
        variant: "destructive"
      })
      return false
    }
  }

  const deleteClienteAntigo = async (id: string) => {
    try {
      console.log('🔄 [useClientesAntigos] Deletando cliente antigo:', id)
      
      const { error } = await supabase
        .from('clientes_antigos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ [useClientesAntigos] Erro ao deletar cliente antigo:', error)
        toast({
          title: "Erro",
          description: "Erro ao deletar cliente antigo",
          variant: "destructive"
        })
        return false
      }

      console.log('✅ [useClientesAntigos] Cliente antigo deletado com sucesso')
      toast({
        title: "Sucesso",
        description: "Cliente antigo deletado com sucesso"
      })
      
      // Atualizar a lista
      await fetchClientesAntigos()
      return true
    } catch (error) {
      console.error('❌ [useClientesAntigos] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao deletar cliente",
        variant: "destructive"
      })
      return false
    }
  }

  useEffect(() => {
    fetchClientesAntigos()
  }, [])

  return {
    clientesAntigos,
    loading,
    fetchClientesAntigos,
    addClienteAntigo,
    updateClienteAntigo,
    deleteClienteAntigo
  }
}
