
import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useChatUnreadMessages(emailCliente?: string, emailGestor?: string) {
  const { user, isCliente, isGestor, isAdmin } = useAuth()

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
      
      return true
    } catch (err) {
      console.error('Erro ao marcar mensagens como lidas:', err)
      return false
    }
  }, [user?.email, isCliente, isGestor, isAdmin, emailCliente, emailGestor])

  return {
    marcarTodasComoLidas
  }
}
