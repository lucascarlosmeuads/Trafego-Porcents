
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export interface ChatConversaPreview {
  email_cliente: string
  email_gestor?: string
  nome_cliente: string
  status_campanha: string
  ultima_mensagem: string
  ultima_mensagem_data: string
  mensagens_nao_lidas: number
  tem_mensagens_nao_lidas: boolean
}

export function useChatConversasCore(gestorFiltro?: string | null) {
  const [conversas, setConversas] = useState<ChatConversaPreview[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isGestor, isAdmin } = useAuth()

  const carregarConversas = useCallback(async () => {
    if (!user?.email || (!isGestor && !isAdmin)) return

    try {
      setLoading(true)
      
      // Buscar clientes do gestor
      let clientesQuery = supabase
        .from('todos_clientes')
        .select('email_cliente, nome_cliente, status_campanha, email_gestor')

      if (isGestor) {
        clientesQuery = clientesQuery.eq('email_gestor', user.email)
      } else if (isAdmin && gestorFiltro) {
        // Admin filtrando por gestor específico
        clientesQuery = clientesQuery.eq('email_gestor', gestorFiltro)
      }

      const { data: clientes, error: clientesError } = await clientesQuery

      if (clientesError) throw clientesError

      const conversasComMensagens = await Promise.all(
        (clientes || []).map(async (cliente) => {
          // Buscar última mensagem
          const { data: ultimaMensagem } = await supabase
            .from('chat_mensagens')
            .select('conteudo, created_at')
            .eq('email_cliente', cliente.email_cliente)
            .eq('email_gestor', cliente.email_gestor)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Contar mensagens não lidas
          const { count: naoLidas } = await supabase
            .from('chat_mensagens')
            .select('*', { count: 'exact', head: true })
            .eq('email_cliente', cliente.email_cliente)
            .eq('email_gestor', cliente.email_gestor)
            .eq('lida', false)
            .neq('remetente', isGestor ? 'gestor' : 'cliente')

          return {
            email_cliente: cliente.email_cliente,
            email_gestor: cliente.email_gestor,
            nome_cliente: cliente.nome_cliente,
            status_campanha: cliente.status_campanha,
            ultima_mensagem: ultimaMensagem?.conteudo || 'Nenhuma mensagem',
            ultima_mensagem_data: ultimaMensagem?.created_at || '',
            mensagens_nao_lidas: naoLidas || 0,
            tem_mensagens_nao_lidas: (naoLidas || 0) > 0
          }
        })
      )

      // Ordenar: primeiro as com mensagens não lidas, depois por última atividade
      const conversasOrdenadas = conversasComMensagens.sort((a, b) => {
        // Primeiro critério: mensagens não lidas
        if (a.tem_mensagens_nao_lidas && !b.tem_mensagens_nao_lidas) return -1
        if (!a.tem_mensagens_nao_lidas && b.tem_mensagens_nao_lidas) return 1
        
        // Segundo critério: última atividade
        const dataA = new Date(a.ultima_mensagem_data).getTime()
        const dataB = new Date(b.ultima_mensagem_data).getTime()
        return dataB - dataA
      })

      setConversas(conversasOrdenadas)
    } catch (err) {
      console.error('Erro ao carregar conversas:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.email, isGestor, isAdmin, gestorFiltro])

  return {
    conversas,
    loading,
    carregarConversas,
    setConversas
  }
}
