
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useChatRealtime(
  userEmail: string | undefined,
  reloadCallback: () => void
) {
  useEffect(() => {
    if (!userEmail) return

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
          reloadCallback()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userEmail, reloadCallback])
}
