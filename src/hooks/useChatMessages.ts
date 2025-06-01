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
      console.log('🔄 [useChatMessages] Marcando mensagens como lidas para:', {
        userEmail: user.email,
        emailCliente,
        emailGestor,
        isCliente,
        isGestor,
        isAdmin
      })

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
      
      console.log('✅ [useChatMessages] Mensagens marcadas como lidas com sucesso')
      
      carregarMensagens()
    } catch (err) {
      console.error('❌ [useChatMessages] Erro ao marcar mensagens como lidas:', err)
    }
  }, [user?.email, isCliente, isGestor, isAdmin, emailCliente, emailGestor, carregarMensagens])

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
  const [chatsProcessandoLeitura, setChatsProcessandoLeitura] = useState<Set<string>>(new Set())
  const [chatsLidosLocalmente, setChatsLidosLocalmente] = useState<Set<string>>(new Set())
  const { user, isGestor, isAdmin } = useAuth()

  const marcarChatComoProcessandoLeitura = useCallback((emailCliente: string, emailGestor: string) => {
    const chaveChat = `${emailCliente}-${emailGestor}`
    console.log('🟡 [useChatConversas] Marcando chat como processando leitura:', chaveChat)
    setChatsProcessandoLeitura(prev => new Set(prev).add(chaveChat))
  }, [])

  const marcarChatComoLidoLocalmente = useCallback((emailCliente: string, emailGestor: string) => {
    const chaveChat = `${emailCliente}-${emailGestor}`
    console.log('📖 [useChatConversas] Marcando chat como lido localmente:', chaveChat)
    setChatsLidosLocalmente(prev => new Set(prev).add(chaveChat))
  }, [])

  const pararProcessamentoLeitura = useCallback((emailCliente: string, emailGestor: string) => {
    const chaveChat = `${emailCliente}-${emailGestor}`
    console.log('⏹️ [useChatConversas] Parando processamento de leitura:', chaveChat)
    setChatsProcessandoLeitura(prev => {
      const newSet = new Set(prev)
      newSet.delete(chaveChat)
      return newSet
    })
  }, [])

  const carregarConversas = useCallback(async () => {
    if (!user?.email || (!isGestor && !isAdmin)) return

    try {
      setLoading(true)
      
      console.log('🔍 [useChatConversas] Carregando conversas para:', user.email, 'Tipo:', isGestor ? 'Gestor' : 'Admin')
      
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

      console.log('👥 [useChatConversas] Clientes encontrados:', clientes?.length || 0)

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

          // CORREÇÃO: Aguardar um tempo para garantir que a marcação foi processada
          await new Promise(resolve => setTimeout(resolve, 100))

          const { count: naoLidasCount } = await supabase
            .from('chat_mensagens')
            .select('*', { count: 'exact', head: true })
            .eq('email_cliente', cliente.email_cliente)
            .eq('email_gestor', cliente.email_gestor)
            .eq('lida', false)
            .eq('remetente', 'cliente')

          const chaveChat = `${cliente.email_cliente}-${cliente.email_gestor}`
          const estaSendoProcessado = chatsProcessandoLeitura.has(chaveChat)
          const foiLidoLocalmente = chatsLidosLocalmente.has(chaveChat)
          
          // CORREÇÃO PRINCIPAL: Se foi lido localmente ou está sendo processado, forçar zero mensagens não lidas
          let mensagensNaoLidasFinais = naoLidasCount || 0
          
          if (estaSendoProcessado || foiLidoLocalmente) {
            console.log(`🔧 [useChatConversas] Forçando zero mensagens não lidas para ${cliente.nome_cliente} (processando: ${estaSendoProcessado}, lido local: ${foiLidoLocalmente})`)
            mensagensNaoLidasFinais = 0
          }
          
          // CORREÇÃO: Se o banco agora mostra zero mensagens não lidas, limpar o estado local
          if ((naoLidasCount || 0) === 0 && foiLidoLocalmente) {
            console.log(`🧹 [useChatConversas] Limpando estado local para ${cliente.nome_cliente} (confirmado no banco)`)
            setChatsLidosLocalmente(prev => {
              const newSet = new Set(prev)
              newSet.delete(chaveChat)
              return newSet
            })
          }
          
          console.log(`📊 [useChatConversas] Cliente: ${cliente.nome_cliente}`, {
            ultimaMensagem: ultimaMensagem?.conteudo || 'Nenhuma',
            mensagensNaoLidasDB: naoLidasCount || 0,
            estaSendoProcessado,
            foiLidoLocalmente,
            mensagensNaoLidasFinais
          })

          return {
            email_cliente: cliente.email_cliente,
            email_gestor: cliente.email_gestor,
            nome_cliente: cliente.nome_cliente,
            status_campanha: cliente.status_campanha,
            ultima_mensagem: ultimaMensagem?.conteudo || 'Nenhuma mensagem',
            ultima_mensagem_data: ultimaMensagem?.created_at || '',
            mensagens_nao_lidas: mensagensNaoLidasFinais,
            tem_mensagens_nao_lidas: mensagensNaoLidasFinais > 0
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

      console.log('✅ [useChatConversas] Conversas processadas:', conversasOrdenadas.length)
      setConversas(conversasOrdenadas)
      
    } catch (err) {
      console.error('❌ [useChatConversas] Erro ao carregar conversas:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.email, isGestor, isAdmin, gestorFiltro, chatsProcessandoLeitura, chatsLidosLocalmente])

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
          
          // CORREÇÃO: Se for uma nova mensagem do cliente, limpar estado local
          if (payload.eventType === 'INSERT' && payload.new) {
            const novaMensagem = payload.new as any
            if (novaMensagem.remetente === 'cliente') {
              const chaveChat = `${novaMensagem.email_cliente}-${novaMensagem.email_gestor}`
              console.log('📨 [useChatConversas] Nova mensagem do cliente, limpando estado local:', chaveChat)
              setChatsLidosLocalmente(prev => {
                const newSet = new Set(prev)
                newSet.delete(chaveChat)
                return newSet
              })
              setChatsProcessandoLeitura(prev => {
                const newSet = new Set(prev)
                newSet.delete(chaveChat)
                return newSet
              })
            }
          }
          
          // CORREÇÃO: Delay maior para garantir sincronização com banco
          setTimeout(() => {
            carregarConversas()
          }, 2000)
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
    recarregar: carregarConversas,
    marcarChatComoProcessandoLeitura,
    marcarChatComoLidoLocalmente,
    pararProcessamentoLeitura,
    estaProcessandoLeitura: (emailCliente: string, emailGestor: string) => {
      const chaveChat = `${emailCliente}-${emailGestor}`
      return chatsProcessandoLeitura.has(chaveChat)
    },
    foiLidoLocalmente: (emailCliente: string, emailGestor: string) => {
      const chaveChat = `${emailCliente}-${emailGestor}`
      return chatsLidosLocalmente.has(chaveChat)
    }
  }
}
