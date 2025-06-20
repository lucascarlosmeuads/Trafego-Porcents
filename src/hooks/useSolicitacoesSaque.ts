
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface SolicitacaoSaque {
  id: string
  email_gestor: string
  nome_gestor: string
  cliente_id: number
  valor_comissao: number
  data_solicitacao: string
  status_saque: 'pendente' | 'aprovado' | 'rejeitado'
  processado_em: string | null
  created_at: string
  updated_at: string
}

export function useSolicitacoesSaque() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoSaque[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSolicitacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitacoes_saque')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar solicitações de saque:', error)
        throw error
      }

      setSolicitacoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar solicitações de saque:', error)
      toast({
        title: "Erro ao carregar solicitações",
        description: "Não foi possível carregar as solicitações de saque.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateStatusSaque = async (id: string, novoStatus: 'aprovado' | 'rejeitado') => {
    try {
      const { error } = await supabase
        .from('solicitacoes_saque')
        .update({ 
          status_saque: novoStatus,
          processado_em: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Erro ao atualizar status do saque:', error)
        throw error
      }

      await fetchSolicitacoes()
      
      toast({
        title: "Status atualizado!",
        description: `Solicitação ${novoStatus === 'aprovado' ? 'aprovada' : 'rejeitada'} com sucesso.`,
      })

      return true
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      })
      return false
    }
  }

  useEffect(() => {
    fetchSolicitacoes()

    // Realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solicitacoes_saque'
        },
        () => {
          fetchSolicitacoes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    solicitacoes,
    loading,
    updateStatusSaque,
    refetch: fetchSolicitacoes
  }
}
