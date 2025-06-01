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

  const marcarMensagensComoLidasAutomaticamente = useCallback(async () => {
    if (!user?.email || !emailCliente || !emailGestor) return

    try {
      console.log('🔄 [useChatMessages] Marcação automática como lida iniciada')
      
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
      } else if (isAdmin) {
        query = query
          .eq('email_cliente', emailCliente)
          .eq('email_gestor', emailGestor)
      }

      const { error } = await query

      if (error) throw error
      
      console.log('✅ [useChatMessages] Mensagens marcadas como lidas automaticamente')
      
      // Recarregar mensagens imediatamente para refletir as mudanças
      carregarMensagens()
      
    } catch (err) {
      console.error('❌ [useChatMessages] Erro na marcação automática:', err)
    }
  }, [user?.email, isCliente, isGestor, isAdmin, emailCliente, emailGestor, carregarMensagens])

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

    setTimeout(() => {
      marcarMensagensComoLidasAutomaticamente()
    }, 200)
  }, [user?.email, isCliente, isGestor, emailCliente, emailGestor, marcarMensagensComoLidasAutomaticamente])

  const marcarComoLida = useCallback(async (mensagemId: string) => {
    const { error } = await supabase
      .from('chat_mensagens')
      .update({ lida: true })
      .eq('id', mensagemId)

    if (error) throw error
  }, [])

  const marcarTodasComoLidas = useCallback(async () => {
    await marcarMensagensComoLidasAutomaticamente()
  }, [marcarMensagensComoLidasAutomaticamente])

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
  }, [carregarMensagens, user?.email, emailCliente, emailGestor])

  return {
    mensagens,
    loading,
    error,
    enviarMensagem,
    marcarComoLida,
    marcarTodasComoLidas,
    recarregar: carregarMensagens,
    marcarMensagensComoLidasAutomaticamente
  }
}

export function useChatConversas(gestorFiltro?: string | null) {
  const [conversas, setConversas] = useState<ChatConversaPreview[]>([])
  const [loading, setLoading] = useState(true)
  // ESTADO PRINCIPAL: Chats que foram clicados/lidos nesta sessão
  const [chatsLidosEstaSecao, setChatsLidosEstaSecao] = useState<Set<string>>(new Set())
  const { user, isGestor, isAdmin } = useAuth()

  // NOVA FUNÇÃO: Forçar atualização imediata do estado das conversas
  const atualizarConversaComoLida = useCallback((emailCliente: string, emailGestor: string) => {
    console.log('🔄 [useChatConversas] Atualizando conversa como lida IMEDIATAMENTE:', emailCliente)
    
    setConversas(prev => prev.map(conversa => {
      if (conversa.email_cliente === emailCliente && conversa.email_gestor === emailGestor) {
        return {
          ...conversa,
          tem_mensagens_nao_lidas: false,
          mensagens_nao_lidas: 0
        }
      }
      return conversa
    }))
  }, [])

  // Marcar um chat como lido desta sessão COM FEEDBACK IMEDIATO
  const marcarChatComoLidoEstaSecao = useCallback((emailCliente: string, emailGestor: string) => {
    const chaveChat = `${emailCliente}-${emailGestor}`
    console.log('✅ [useChatConversas] Marcando chat como lido desta sessão:', chaveChat)
    
    // 1. ATUALIZAR ESTADO LOCAL IMEDIATAMENTE
    setChatsLidosEstaSecao(prev => {
      const newSet = new Set(prev)
      newSet.add(chaveChat)
      return newSet
    })

    // 2. FORÇAR ATUALIZAÇÃO VISUAL IMEDIATA
    atualizarConversaComoLida(emailCliente, emailGestor)

    // 3. MARCAÇÃO AUTOMÁTICA NO BANCO DE DADOS (em background)
    const marcarNoBanco = async () => {
      try {
        console.log('🔄 [useChatConversas] Marcando mensagens como lidas no banco')
        
        const { error } = await supabase
          .from('chat_mensagens')
          .update({ lida: true })
          .eq('email_cliente', emailCliente)
          .eq('email_gestor', emailGestor)
          .eq('remetente', 'cliente')
          .eq('lida', false)

        if (error) throw error
        
        console.log('✅ [useChatConversas] Mensagens marcadas no banco com sucesso')
        
        // Recarregar conversas após 1s para sincronizar com banco
        setTimeout(() => {
          carregarConversas()
        }, 1000)
        
      } catch (err) {
        console.error('❌ [useChatConversas] Erro ao marcar no banco:', err)
      }
    }

    // Executar marcação no banco imediatamente
    marcarNoBanco()
  }, [atualizarConversaComoLida])

  // Remover um chat do estado lido (quando nova mensagem chegar)
  const removerChatDoEstadoLido = useCallback((emailCliente: string, emailGestor: string) => {
    const chaveChat = `${emailCliente}-${emailGestor}`
    console.log('🔄 [useChatConversas] Removendo chat do estado lido (nova mensagem):', chaveChat)
    
    setChatsLidosEstaSecao(prev => {
      const newSet = new Set(prev)
      newSet.delete(chaveChat)
      return newSet
    })
  }, [])

  // Verificar se chat foi lido nesta sessão
  const chatFoiLidoEstaSecao = useCallback((emailCliente: string, emailGestor: string) => {
    const chaveChat = `${emailCliente}-${emailGestor}`
    return chatsLidosEstaSecao.has(chaveChat)
  }, [chatsLidosEstaSecao])

  const carregarConversas = useCallback(async () => {
    if (!user?.email || (!isGestor && !isAdmin)) return

    try {
      setLoading(true)
      
      console.log('🔍 [useChatConversas] Carregando conversas para:', user.email)
      
      let clientesQuery = supabase
        .from('todos_clientes')
        .select('email_cliente, nome_cliente, status_campanha, email_gestor')
        .not('email_cliente', 'is', null)
        .not('nome_cliente', 'is', null)

      if (isGestor) {
        clientesQuery = clientesQuery.eq('email_gestor', user.email)
      } else if (isAdmin && gestorFiltro) {
        clientesQuery = clientesQuery.eq('email_gestor', gestorFiltro)
      }

      const { data: clientes, error: clientesError } = await clientesQuery

      if (clientesError) throw clientesError

      if (!clientes || clientes.length === 0) {
        setConversas([])
        return
      }

      const conversasComMensagens = await Promise.all(
        clientes.map(async (cliente) => {
          const { data: ultimaMensagem } = await supabase
            .from('chat_mensagens')
            .select('conteudo, created_at')
            .eq('email_cliente', cliente.email_cliente)
            .eq('email_gestor', cliente.email_gestor)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          const { count: naoLidasCount } = await supabase
            .from('chat_mensagens')
            .select('*', { count: 'exact', head: true })
            .eq('email_cliente', cliente.email_cliente)
            .eq('email_gestor', cliente.email_gestor)
            .eq('lida', false)
            .eq('remetente', 'cliente')

          const chaveChat = `${cliente.email_cliente}-${cliente.email_gestor}`
          const foiLidoEstaSecao = chatsLidosEstaSecao.has(chaveChat)
          
          // LÓGICA PRINCIPAL: Se foi lido nesta sessão, considerar como lido
          const mensagensNaoLidas = naoLidasCount || 0
          const temMensagensNaoLidas = mensagensNaoLidas > 0 && !foiLidoEstaSecao
          
          console.log(`📊 [useChatConversas] Cliente: ${cliente.nome_cliente}`, {
            mensagensNaoLidas,
            foiLidoEstaSecao,
            temMensagensNaoLidas
          })

          return {
            email_cliente: cliente.email_cliente,
            email_gestor: cliente.email_gestor,
            nome_cliente: cliente.nome_cliente,
            status_campanha: cliente.status_campanha,
            ultima_mensagem: ultimaMensagem?.conteudo || 'Nenhuma mensagem',
            ultima_mensagem_data: ultimaMensagem?.created_at || '',
            mensagens_nao_lidas: mensagensNaoLidas,
            tem_mensagens_nao_lidas: temMensagensNaoLidas
          }
        })
      )

      const conversasOrdenadas = conversasComMensagens.sort((a, b) => {
        if (a.tem_mensagens_nao_lidas && !b.tem_mensagens_nao_lidas) return -1
        if (!a.tem_mensagens_nao_lidas && b.tem_mensagens_nao_lidas) return 1
        
        const dataA = new Date(a.ultima_mensagem_data).getTime()
        const dataB = new Date(b.ultima_mensagem_data).getTime()
        return dataB - dataA
      })

      setConversas(conversasOrdenadas)
      
    } catch (err) {
      console.error('❌ [useChatConversas] Erro ao carregar conversas:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.email, isGestor, isAdmin, gestorFiltro, chatsLidosEstaSecao])

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
        (payload) => {
          console.log('🔄 [useChatConversas] Realtime: mudança nas mensagens', payload.eventType)
          
          // Se é uma nova mensagem do cliente, remover do estado lido
          if (payload.eventType === 'INSERT' && payload.new) {
            const mensagem = payload.new as any
            if (mensagem.remetente === 'cliente') {
              removerChatDoEstadoLido(mensagem.email_cliente, mensagem.email_gestor)
            }
          }
          
          setTimeout(() => {
            carregarConversas()
          }, 500)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [carregarConversas, removerChatDoEstadoLido])

  return {
    conversas,
    loading,
    recarregar: carregarConversas,
    marcarChatComoLidoEstaSecao,
    chatFoiLidoEstaSecao,
    atualizarConversaComoLida, // NOVA FUNÇÃO EXPORTADA
    // NOVA FUNÇÃO: Calcular total não lidas considerando estado local
    getTotalNaoLidas: useCallback(() => {
      return conversas.filter(c => {
        const chaveChat = `${c.email_cliente}-${c.email_gestor}`
        const foiLidoEstaSecao = chatsLidosEstaSecao.has(chaveChat)
        return c.tem_mensagens_nao_lidas && !foiLidoEstaSecao
      }).length
    }, [conversas, chatsLidosEstaSecao])
  }
}
