
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
  formulario_acessado_em: string | null
  token_acesso: string | null
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

  const generateUniqueToken = () => {
    return `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const createSolicitation = async (clienteData: {
    email_cliente: string
    nome_cliente: string
    telefone?: string
    email_gestor?: string
  }) => {
    try {
      // Verificar se já existe solicitação para este cliente
      const { data: existingSolicitation, error: checkError } = await supabase
        .from('solicitacoes_site')
        .select('*')
        .eq('email_cliente', clienteData.email_cliente)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingSolicitation) {
        toast({
          title: "Aviso",
          description: "Você já possui uma solicitação de site. Verifique o status abaixo.",
          variant: "default"
        })
        return { success: false, existing: true }
      }

      const token = generateUniqueToken()

      const { data, error } = await supabase
        .from('solicitacoes_site')
        .insert([{
          email_cliente: clienteData.email_cliente,
          nome_cliente: clienteData.nome_cliente,
          telefone: clienteData.telefone,
          email_gestor: clienteData.email_gestor || 'andreza@trafegoporcents.com',
          status: 'pendente',
          token_acesso: token
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
        return { success: false }
      }

      toast({
        title: "Sucesso",
        description: "Solicitação de site enviada! Agora você pode acessar o formulário.",
      })
      
      fetchSolicitations()
      return { success: true, data }
    } catch (error) {
      console.error('❌ Erro inesperado:', error)
      return { success: false }
    }
  }

  const markFormAccessed = async (solicitationId: string) => {
    try {
      const { error } = await supabase
        .from('solicitacoes_site')
        .update({ 
          formulario_acessado_em: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', solicitationId)

      if (error) {
        console.error('❌ Erro ao marcar formulário como acessado:', error)
        return false
      }

      fetchSolicitations()
      return true
    } catch (error) {
      console.error('❌ Erro inesperado:', error)
      return false
    }
  }

  const getClientSolicitation = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('solicitacoes_site')
        .select('*')
        .eq('email_cliente', email)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar solicitação do cliente:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Erro inesperado:', error)
      return null
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
    fetchSolicitations,
    markFormAccessed,
    getClientSolicitation
  }
}
