
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface SiteSolicitation {
  id: string
  email_cliente: string
  nome_cliente: string
  telefone: string | null
  email_gestor: string | null
  status: 'pendente' | 'em_andamento' | 'concluido'
  dados_preenchidos: boolean
  observacoes: string | null
  created_at: string
  updated_at: string
}

export function useSiteSolicitations() {
  const [solicitations, setSolicitations] = useState<SiteSolicitation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSolicitations = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitacoes_site')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar solicitações de site:', error)
        toast({
          title: "Erro",
          description: "Erro ao carregar solicitações de site",
          variant: "destructive"
        })
      } else {
        setSolicitations(data || [])
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSolicitation = async (clienteData: {
    email_cliente: string
    nome_cliente: string
    telefone?: string
    email_gestor?: string
  }) => {
    try {
      const { data, error } = await supabase
        .from('solicitacoes_site')
        .insert([{
          email_cliente: clienteData.email_cliente,
          nome_cliente: clienteData.nome_cliente,
          telefone: clienteData.telefone,
          email_gestor: clienteData.email_gestor || 'andreza@trafegoporcents.com',
          status: 'pendente'
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar solicitação:', error)
        toast({
          title: "Erro",
          description: "Erro ao enviar solicitação de site",
          variant: "destructive"
        })
        return false
      }

      toast({
        title: "Sucesso",
        description: "Solicitação de site enviada! A Andreza entrará em contato em breve.",
      })
      
      fetchSolicitations()
      return true
    } catch (error) {
      console.error('❌ Erro inesperado:', error)
      return false
    }
  }

  const updateSolicitationStatus = async (id: string, status: SiteSolicitation['status'], observacoes?: string) => {
    try {
      const { error } = await supabase
        .from('solicitacoes_site')
        .update({ 
          status,
          observacoes: observacoes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao atualizar status:', error)
        toast({
          title: "Erro",
          description: "Erro ao atualizar status da solicitação",
          variant: "destructive"
        })
        return false
      }

      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso"
      })
      
      fetchSolicitations()
      return true
    } catch (error) {
      console.error('❌ Erro inesperado:', error)
      return false
    }
  }

  useEffect(() => {
    fetchSolicitations()

    // Configurar realtime para atualizações
    const subscription = supabase
      .channel('solicitacoes-site-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solicitacoes_site'
        },
        () => {
          console.log('🔄 Atualizando solicitações de site...')
          fetchSolicitations()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    solicitations,
    loading,
    createSolicitation,
    updateSolicitationStatus,
    fetchSolicitations
  }
}
