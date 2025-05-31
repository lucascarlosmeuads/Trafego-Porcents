
import { useEffect } from 'react'
import { useChatMessagesCore } from '@/hooks/chat/useChatMessagesCore'
import { useChatMessageActions } from '@/hooks/chat/useChatMessageActions'
import { useChatUnreadMessages } from '@/hooks/chat/useChatUnreadMessages'
import { useChatRealtime } from '@/hooks/chat/useChatRealtime'
import { useChatConversasCore } from '@/hooks/chat/useChatConversasCore'
import { useAuth } from '@/hooks/useAuth'

// Re-export interfaces for backward compatibility
export type { ChatMensagem } from '@/hooks/chat/useChatMessagesCore'
export type { ChatConversaPreview } from '@/hooks/chat/useChatConversasCore'

export function useChatMessages(emailCliente?: string, emailGestor?: string) {
  const { user, isCliente } = useAuth()
  
  // Core message loading
  const { mensagens, loading, error, carregarMensagens } = useChatMessagesCore(emailCliente, emailGestor)
  
  // Message actions
  const { enviarMensagem, marcarComoLida } = useChatMessageActions(emailCliente, emailGestor)
  
  // Unread message handling
  const { marcarTodasComoLidas } = useChatUnreadMessages(emailCliente, emailGestor)
  
  // Realtime updates
  useChatRealtime(user?.email, carregarMensagens)

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
  const { user } = useAuth()
  
  // Core conversation loading
  const { conversas, loading, carregarConversas } = useChatConversasCore(gestorFiltro)
  
  // Realtime updates for conversations
  useChatRealtime(user?.email, carregarConversas)

  return {
    conversas,
    loading,
    recarregar: carregarConversas
  }
}
