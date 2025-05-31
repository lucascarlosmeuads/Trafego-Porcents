
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export interface ChatMensagem {
  id: string
  cliente_id: string
  email_cliente: string
  email_gestor: string
  remetente: 'cliente' | 'gestor'
  tipo: 'texto' | 'audio'
  conteudo: string
  status_campanha?: string
  lida: boolean
  created_at: string
  updated_at: string
}

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

export function useChatMessages(emailCliente?: string, emailGestor?: string) {
  const [mensagens, setMensagens] = useState<ChatMensagem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAdmin, isGestor, isCliente } = useAuth()

  const carregarMensagens = useCallback(async () => {
    if (!user?.email) return

    try {
      setLoading(true)
      let query = supabase
        .from('chat_mensagens')
        .select('*')
        .order('created_at', { ascending: true })

      // Filtrar baseado no tipo de usuário
      if (isCliente) {
        query = query.eq('email_cliente', user.email)
      } else if (isGestor && emailCliente) {
        query = query
          .eq('email_cliente', emailCliente)
          .eq('email_gestor', user.email)
      } else if (isAdmin && emailCliente && emailGestor) {
        query = query
          .eq('email_cliente', emailCliente)
          .eq('email_gestor', emailGestor)
      }

      const { data, error } = await query

      if (error) throw error
      setMensagens(data || [])
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [user?.email, isCliente, isGestor, isAdmin, emailCliente, emailGestor])

  const enviarMensagem = useCallback(async (
    conteudo: string, 
    tipo: 'texto' | 'audio' = 'texto',
    emailClienteTarget?: string
  ) => {
    if (!user?.email) throw new Error('Usuário não autenticado')

    const remetente = isCliente ? 'cliente' : 'gestor'
    const emailClienteFinal = isCliente ? user.email : (emailClienteTarget || emailCliente)
    const emailGestorFinal = isGestor ? user.email : emailGestor

    if (!emailClienteFinal || !emailGestorFinal) {
      throw new Error('Email do cliente ou gestor não definido')
    }

    // Buscar status atual da campanha
    const { data: clienteData } = await supabase
      .from('todos_clientes')
      .select('status_campanha, id')
      .eq('email_cliente', emailClienteFinal)
      .maybeSingle()

    const novaMensagem = {
      cliente_id: clienteData?.id?.toString() || '',
      email_cliente: emailClienteFinal,
      email_gestor: emailGestorFinal,
      remetente,
      tipo,
      conteudo,
      status_campanha: clienteData?.status_campanha || null,
      lida: false
    }

    const { error } = await supabase
      .from('chat_mensagens')
      .insert([novaMensagem])

    if (error) throw error
  }, [user?.email, isCliente, isGestor, emailCliente, emailGestor])

  const marcarComoLida = useCallback(async (mensagemId: string) => {
    const { error } = await supabase
      .from('chat_mensagens')
      .update({ lida: true })
      .eq('id', mensagemId)

    if (error) throw error
  }, [])

  const marcarTodasComoLidas = useCallback(async () => {
    if (!user?.email || !emailCliente) return

    try {
      const remetenteOposto = isCliente ? 'gestor' : 'cliente'
      
      let query = supabase
        .from('chat_mensagens')
        .update({ lida: true })
        .eq('lida', false)
        .eq('remetente', remetenteOposto)

      if (isCliente) {
        query = query.eq('email_cliente', user.email)
      } else if (isGestor) {
        query = query
          .eq('email_cliente', emailCliente)
          .eq('email_gestor', user.email)
      } else if (isAdmin && emailGestor) {
        query = query
          .eq('email_cliente', emailCliente)
          .eq('email_gestor', emailGestor)
      }

      const { error } = await query

      if (error) throw error
      
      // Recarregar mensagens para atualizar estado
      carregarMensagens()
    } catch (err) {
      console.error('Erro ao marcar mensagens como lidas:', err)
    }
  }, [user?.email, isCliente, isGestor, isAdmin, emailCliente, emailGestor, carregarMensagens])

  // Configurar realtime
  useEffect(() => {
    if (!user?.email) return

    carregarMensagens()

    const channel = supabase
      .channel('chat-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_mensagens'
        },
        () => {
          carregarMensagens()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [carregarMensagens, user?.email])

  // Auto-marcar como lidas quando entrar na conversa
  useEffect(() => {
    if (mensagens.length > 0 && !isCliente) {
      // Pequeno delay para garantir que a conversa foi carregada
      const timer = setTimeout(() => {
        marcarTodasComoLidas()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [emailCliente, emailGestor, marcarTodasComoLidas, isCliente])

  return {
    mensagens,
    loading,
    error,
    enviarMensagem,
    marcarComoLida,
    marcarTodasComoLidas,
    recarregar: carregarMensagens
  }
}

export function useChatConversas(gestorFiltro?: string | null) {
  const [conversas, setConversas] = useState<ChatConversaPreview[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isGestor, isAdmin } = useAuth()

  const carregarConversas = useCallback(async () => {
    if (!user?.email || (!isGestor && !isAdmin)) return

    try {
      setLoading(true)
      
      console.log('🔍 Carregando conversas para:', user.email, 'Tipo:', isGestor ? 'Gestor' : 'Admin')
      
      // CORREÇÃO: Query otimizada para buscar clientes e suas últimas mensagens
      let clientesQuery = supabase
        .from('todos_clientes')
        .select('email_cliente, nome_cliente, status_campanha, email_gestor')

      if (isGestor) {
        clientesQuery = clientesQuery.eq('email_gestor', user.email)
      } else if (isAdmin && gestorFiltro) {
        clientesQuery = clientesQuery.eq('email_gestor', gestorFiltro)
      }

      const { data: clientes, error: clientesError } = await clientesQuery

      if (clientesError) throw clientesError

      console.log('👥 Clientes encontrados:', clientes?.length || 0)

      if (!clientes || clientes.length === 0) {
        setConversas([])
        return
      }

      // CORREÇÃO: Query única para buscar todas as últimas mensagens
      const { data: ultimasMensagens } = await supabase
        .from('chat_mensagens')
        .select('email_cliente, email_gestor, conteudo, created_at')
        .in('email_cliente', clientes.map(c => c.email_cliente))
        .order('created_at', { ascending: false })

      console.log('💬 Total de mensagens encontradas:', ultimasMensagens?.length || 0)

      // CORREÇÃO: Query única para contar mensagens não lidas por cliente
      const { data: mensagensNaoLidas } = await supabase
        .from('chat_mensagens')
        .select('email_cliente, email_gestor')
        .in('email_cliente', clientes.map(c => c.email_cliente))
        .eq('lida', false)
        .eq('remetente', 'cliente')

      console.log('🔴 Mensagens não lidas encontradas:', mensagensNaoLidas?.length || 0)

      const conversasComMensagens = clientes.map(cliente => {
        console.log(`📝 Processando cliente: ${cliente.nome_cliente} (${cliente.email_cliente})`)
        
        // CORREÇÃO: Buscar última mensagem específica para este cliente/gestor
        const ultimaMensagemCliente = ultimasMensagens?.find(m => 
          m.email_cliente === cliente.email_cliente && 
          m.email_gestor === cliente.email_gestor
        )

        // CORREÇÃO: Contar mensagens não lidas específicas para este cliente/gestor
        const naoLidasCount = mensagensNaoLidas?.filter(m => 
          m.email_cliente === cliente.email_cliente && 
          m.email_gestor === cliente.email_gestor
        ).length || 0

        console.log(`📊 Cliente: ${cliente.nome_cliente}`, {
          ultimaMensagem: ultimaMensagemCliente?.conteudo || 'Nenhuma',
          mensagensNaoLidas: naoLidasCount
        })

        return {
          email_cliente: cliente.email_cliente,
          email_gestor: cliente.email_gestor,
          nome_cliente: cliente.nome_cliente,
          status_campanha: cliente.status_campanha,
          ultima_mensagem: ultimaMensagemCliente?.conteudo || 'Nenhuma mensagem',
          ultima_mensagem_data: ultimaMensagemCliente?.created_at || '',
          mensagens_nao_lidas: naoLidasCount,
          tem_mensagens_nao_lidas: naoLidasCount > 0
        }
      })

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

      console.log('✅ Conversas processadas:', conversasOrdenadas.length)
      setConversas(conversasOrdenadas)
    } catch (err) {
      console.error('❌ Erro ao carregar conversas:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.email, isGestor, isAdmin, gestorFiltro])

  useEffect(() => {
    carregarConversas()

    const channel = supabase
      .channel('conversas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_mensagens'
        },
        () => {
          console.log('🔄 Realtime: mudança nas mensagens, recarregando conversas')
          carregarConversas()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [carregarConversas])

  return {
    conversas,
    loading,
    recarregar: carregarConversas
  }
}
