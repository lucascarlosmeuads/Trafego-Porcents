
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
  origem: 'manual' | 'gestor'
  vendedor?: string
  data_venda?: string
  cliente_id?: string
}

export function useSiteSolicitations() {
  const [solicitations, setSolicitations] = useState<SiteSolicitation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSolicitations = async () => {
    try {
      // Buscar solicitações manuais da tabela solicitacoes_site
      const { data: manualSolicitations, error: manualError } = await supabase
        .from('solicitacoes_site')
        .select('*')
        .order('created_at', { ascending: false })

      if (manualError) {
        console.error('❌ Erro ao buscar solicitações manuais:', manualError)
      }

      // Buscar clientes marcados como "aguardando_link" pelos gestores
      const { data: gestorClients, error: gestorError } = await supabase
        .from('todos_clientes')
        .select('*')
        .eq('site_status', 'aguardando_link')
        .order('created_at', { ascending: false })

      if (gestorError) {
        console.error('❌ Erro ao buscar clientes dos gestores:', gestorError)
      }

      const combinedSolicitations: SiteSolicitation[] = []

      // Processar solicitações manuais
      if (manualSolicitations) {
        const manualFormatted = manualSolicitations.map(item => ({
          id: item.id,
          email_cliente: item.email_cliente,
          nome_cliente: item.nome_cliente,
          telefone: item.telefone,
          email_gestor: item.email_gestor,
          status: item.status as 'pendente' | 'em_andamento' | 'concluido',
          dados_preenchidos: item.dados_preenchidos || false,
          observacoes: item.observacoes,
          created_at: item.created_at,
          updated_at: item.updated_at,
          origem: 'manual' as const
        }))
        combinedSolicitations.push(...manualFormatted)
      }

      // Processar clientes dos gestores
      if (gestorClients) {
        const gestorFormatted = gestorClients.map(item => ({
          id: `gestor_${item.id}`, // Prefixo para evitar conflitos de ID
          email_cliente: item.email_cliente || '',
          nome_cliente: item.nome_cliente || '',
          telefone: item.telefone,
          email_gestor: item.email_gestor,
          status: 'pendente' as const, // Clientes marcados pelos gestores começam como pendente
          dados_preenchidos: false, // Assumir que ainda não preencheram
          observacoes: `Cliente marcado pelo gestor como aguardando link do site. Vendedor: ${item.vendedor || 'N/A'}`,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.created_at || new Date().toISOString(),
          origem: 'gestor' as const,
          vendedor: item.vendedor,
          data_venda: item.data_venda,
          cliente_id: item.id.toString()
        }))
        combinedSolicitations.push(...gestorFormatted)
      }

      // Ordenar por data de criação (mais recentes primeiro)
      combinedSolicitations.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setSolicitations(combinedSolicitations)
    } catch (error) {
      console.error('❌ Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar solicitações de site",
        variant: "destructive"
      })
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

  const updateSolicitationStatus = async (
    id: string, 
    status: SiteSolicitation['status'], 
    observacoes?: string
  ) => {
    try {
      const solicitation = solicitations.find(s => s.id === id)
      if (!solicitation) {
        toast({
          title: "Erro",
          description: "Solicitação não encontrada",
          variant: "destructive"
        })
        return false
      }

      if (solicitation.origem === 'manual') {
        // Atualizar na tabela solicitacoes_site
        const { error } = await supabase
          .from('solicitacoes_site')
          .update({ 
            status,
            observacoes: observacoes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        if (error) {
          console.error('❌ Erro ao atualizar solicitação manual:', error)
          toast({
            title: "Erro",
            description: "Erro ao atualizar status da solicitação",
            variant: "destructive"
          })
          return false
        }
      } else {
        // Atualizar na tabela todos_clientes
        const clienteId = solicitation.cliente_id
        if (!clienteId) {
          toast({
            title: "Erro",
            description: "ID do cliente não encontrado",
            variant: "destructive"
          })
          return false
        }

        // Mapear status da solicitação para site_status
        let newSiteStatus = 'aguardando_link'
        if (status === 'em_andamento') {
          newSiteStatus = 'em_producao'
        } else if (status === 'concluido') {
          newSiteStatus = 'finalizado'
        }

        const { error } = await supabase
          .from('todos_clientes')
          .update({ 
            site_status: newSiteStatus,
            descricao_problema: observacoes || null
          })
          .eq('id', parseInt(clienteId))

        if (error) {
          console.error('❌ Erro ao atualizar cliente do gestor:', error)
          toast({
            title: "Erro",
            description: "Erro ao atualizar status do cliente",
            variant: "destructive"
          })
          return false
        }
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

    // Configurar realtime para atualizações nas duas tabelas
    const solicitacoesSubscription = supabase
      .channel('solicitacoes-site-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solicitacoes_site'
        },
        () => {
          console.log('🔄 Atualizando solicitações manuais...')
          fetchSolicitations()
        }
      )
      .subscribe()

    const clientesSubscription = supabase
      .channel('clientes-site-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos_clientes',
          filter: 'site_status=eq.aguardando_link'
        },
        () => {
          console.log('🔄 Atualizando clientes dos gestores...')
          fetchSolicitations()
        }
      )
      .subscribe()

    return () => {
      solicitacoesSubscription.unsubscribe()
      clientesSubscription.unsubscribe()
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
