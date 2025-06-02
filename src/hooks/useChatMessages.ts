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

      console.log('🔍 [useChatMessages] Carregando mensagens para:', {
        userEmail: user.email,
        isAdmin,
        isGestor,
        isCliente,
        emailCliente,
        emailGestor
      })

      if (isCliente) {
        // Cliente só vê suas próprias mensagens
        query = query.eq('email_cliente', user.email)
        console.log('🔍 [useChatMessages] Query Cliente:', { emailCliente: user.email })
      } else if (isGestor && emailCliente) {
        // Gestor vê mensagens de um cliente específico
        query = query
          .eq('email_cliente', emailCliente)
          .eq('email_gestor', user.email)
        console.log('🔍 [useChatMessages] Query Gestor:', { emailCliente, emailGestor: user.email })
      } else if (isAdmin && emailCliente && emailGestor) {
        // Admin vê mensagens entre cliente e gestor específicos
        query = query
          .eq('email_cliente', emailCliente)
          .eq('email_gestor', emailGestor)
        console.log('🔍 [useChatMessages] Query Admin conversa específica:', { emailCliente, emailGestor })
      } else if (isAdmin && emailGestor && !emailCliente) {
        // NOVA FUNCIONALIDADE: Admin vê TODAS as mensagens de um gestor específico
        query = query.eq('email_gestor', emailGestor)
        console.log('🔍 [useChatMessages] Query Admin - TODAS mensagens do gestor:', { emailGestor })
      } else {
        // Se não há filtros válidos, não carregar mensagens
        console.log('❌ [useChatMessages] Nenhum filtro válido definido para carregar mensagens')
        console.log('❌ [useChatMessages] Parâmetros recebidos:', { 
          isAdmin, 
          isGestor, 
          isCliente, 
          emailCliente, 
          emailGestor,
          userEmail: user.email 
        })
        setMensagens([])
        setLoading(false)
        return
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ [useChatMessages] Erro na query:', error)
        throw error
      }

      console.log('✅ [useChatMessages] Mensagens carregadas:', data?.length || 0)
      console.log('✅ [useChatMessages] Dados das mensagens:', data?.slice(0, 2)) // Mostrar apenas as 2 primeiras para debug
      setMensagens(data || [])
    } catch (err) {
      console.error('❌ [useChatMessages] Erro ao carregar mensagens:', err)
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

    console.log('💬 [useChatMessages] Enviando mensagem:', novaMensagem)

    const { error } = await supabase
      .from('chat_mensagens')
      .insert([novaMensagem])

    if (error) throw error
  }, [user?.email, isCliente, isGestor, emailCliente, emailGestor])

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
        (payload) => {
          console.log('🔄 [useChatMessages] Realtime: mudança detectada', payload.eventType)
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
      
      console.log('🔍 [useChatConversas] === INÍCIO CARREGAMENTO ===')
      console.log('🔍 [useChatConversas] Carregando conversas para:', user.email)
      console.log('🔍 [useChatConversas] IsAdmin:', isAdmin, 'IsGestor:', isGestor)
      console.log('🔍 [useChatConversas] Gestor filtro recebido:', gestorFiltro)
      
      let clientesQuery = supabase
        .from('todos_clientes')
        .select('email_cliente, nome_cliente, status_campanha, email_gestor')
        .not('email_cliente', 'is', null)
        .not('nome_cliente', 'is', null)

      if (isGestor) {
        // Gestor só vê seus próprios clientes
        clientesQuery = clientesQuery.eq('email_gestor', user.email)
        console.log('🔍 [useChatConversas] Query Gestor:', { emailGestor: user.email })
      } else if (isAdmin) {
        // Admin vê todas as conversas por padrão, ou filtra por gestor específico se solicitado
        if (gestorFiltro && gestorFiltro !== '__GESTORES__') {
          clientesQuery = clientesQuery.eq('email_gestor', gestorFiltro)
          console.log('🔍 [useChatConversas] Query Admin com filtro:', { gestorFiltro })
        } else {
          console.log('🔍 [useChatConversas] Query Admin sem filtro (todos os gestores)')
        }
        // Se gestorFiltro for null/undefined, admin vê TODAS as conversas
      }

      const { data: clientes, error: clientesError } = await clientesQuery

      if (clientesError) {
        console.error('❌ [useChatConversas] Erro na query de clientes:', clientesError)
        throw clientesError
      }

      console.log('📊 [useChatConversas] Clientes encontrados:', clientes?.length || 0)
      
      // DEBUG: Se for filtro da Andreza, mostrar detalhes
      if (gestorFiltro?.includes('andreza')) {
        console.log('🔍 [useChatConversas] === DETALHES ANDREZA ===')
        console.log('🔍 [useChatConversas] Filtro aplicado:', gestorFiltro)
        console.log('🔍 [useChatConversas] Clientes da Andreza:', clientes)
      }

      if (!clientes || clientes.length === 0) {
        console.log('📊 [useChatConversas] Nenhum cliente encontrado')
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

          return {
            email_cliente: cliente.email_cliente,
            email_gestor: cliente.email_gestor,
            nome_cliente: cliente.nome_cliente,
            status_campanha: cliente.status_campanha,
            ultima_mensagem: ultimaMensagem?.conteudo || 'Nenhuma mensagem',
            ultima_mensagem_data: ultimaMensagem?.created_at || ''
          }
        })
      )

      // Ordenar por data da última mensagem (mais recentes primeiro)
      const conversasOrdenadas = conversasComMensagens.sort((a, b) => {
        if (!a.ultima_mensagem_data && !b.ultima_mensagem_data) return 0
        if (!a.ultima_mensagem_data) return 1
        if (!b.ultima_mensagem_data) return -1
        
        const dataA = new Date(a.ultima_mensagem_data).getTime()
        const dataB = new Date(b.ultima_mensagem_data).getTime()
        return dataB - dataA
      })

      console.log('✅ [useChatConversas] Conversas processadas:', conversasOrdenadas.length)
      console.log('✅ [useChatConversas] Primeiras 3 conversas:', conversasOrdenadas.slice(0, 3))
      setConversas(conversasOrdenadas)
      
    } catch (err) {
      console.error('❌ [useChatConversas] Erro ao carregar conversas:', err)
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
        (payload) => {
          console.log('🔄 [useChatConversas] Realtime: mudança nas mensagens', payload.eventType)
          
          setTimeout(() => {
            carregarConversas()
          }, 500)
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
