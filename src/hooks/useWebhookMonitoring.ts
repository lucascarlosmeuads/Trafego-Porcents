
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export interface WebhookAttempt {
  id: string
  timestamp: string
  method: string
  headers: Record<string, string>
  body: any
  status: 'success' | 'error' | 'processing'
  error_message?: string
  client_created?: boolean
  client_id?: string
}

export function useWebhookMonitoring() {
  const [attempts, setAttempts] = useState<WebhookAttempt[]>([])
  const [isListening, setIsListening] = useState(false)
  const [stats, setStats] = useState({
    totalAttempts: 0,
    successfulAttempts: 0,
    failedAttempts: 0,
    lastAttempt: null as string | null
  })

  useEffect(() => {
    // Buscar tentativas recentes
    fetchRecentAttempts()
    
    // Configurar listener em tempo real
    const channel = supabase
      .channel('webhook-monitoring')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'max_integration_logs'
      }, (payload) => {
        console.log('🔴 [Webhook Monitor] Nova tentativa de webhook detectada:', payload)
        handleNewWebhookAttempt(payload.new)
        
        // Mostrar notificação em tempo real
        toast({
          title: "🚨 Tentativa de Webhook Detectada",
          description: `Status: ${payload.new.status} | Pedido: ${payload.new.pedido_id}`,
          duration: 5000
        })
      })
      .subscribe()

    setIsListening(true)

    return () => {
      channel.unsubscribe()
      setIsListening(false)
    }
  }, [])

  const fetchRecentAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('max_integration_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      const formattedAttempts = data?.map(log => ({
        id: log.id,
        timestamp: log.created_at,
        method: 'POST',
        headers: log.dados_originais?.headers || {},
        body: log.dados_originais,
        status: log.status === 'sucesso' ? 'success' : 
                log.status === 'processando' ? 'processing' : 'error',
        error_message: log.erro_detalhes,
        client_created: log.status === 'sucesso',
        client_id: log.cliente_criado_id?.toString()
      })) || []

      setAttempts(formattedAttempts)
      updateStats(formattedAttempts)
    } catch (error) {
      console.error('Erro ao buscar tentativas de webhook:', error)
    }
  }

  const handleNewWebhookAttempt = (newLog: any) => {
    const newAttempt: WebhookAttempt = {
      id: newLog.id,
      timestamp: newLog.created_at,
      method: 'POST',
      headers: newLog.dados_originais?.headers || {},
      body: newLog.dados_originais,
      status: newLog.status === 'sucesso' ? 'success' : 
              newLog.status === 'processando' ? 'processing' : 'error',
      error_message: newLog.erro_detalhes,
      client_created: newLog.status === 'sucesso',
      client_id: newLog.cliente_criado_id?.toString()
    }

    setAttempts(prev => [newAttempt, ...prev.slice(0, 19)])
    updateStats([newAttempt, ...attempts])
  }

  const updateStats = (attemptsList: WebhookAttempt[]) => {
    const totalAttempts = attemptsList.length
    const successfulAttempts = attemptsList.filter(a => a.status === 'success').length
    const failedAttempts = attemptsList.filter(a => a.status === 'error').length
    const lastAttempt = attemptsList[0]?.timestamp || null

    setStats({
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      lastAttempt
    })
  }

  return {
    attempts,
    stats,
    isListening,
    refetch: fetchRecentAttempts
  }
}
