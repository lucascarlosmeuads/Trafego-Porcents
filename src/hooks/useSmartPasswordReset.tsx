
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface ResetResult {
  email: string
  success: boolean
  message: string
  action_taken: 'password_reset' | 'user_created' | 'email_confirmed' | 'no_action_needed'
}

export function useSmartPasswordReset() {
  const [loading, setLoading] = useState(false)
  const [resetCompleted, setResetCompleted] = useState(false)
  const [resultMessage, setResultMessage] = useState('')
  const { toast } = useToast()

  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true)
    console.log('🔐 [SmartPasswordReset] Iniciando reset inteligente para:', email)

    try {
      const { data, error } = await supabase.functions.invoke('smart-password-reset', {
        body: { email }
      })

      if (error) {
        console.error('❌ [SmartPasswordReset] Erro na Edge Function:', error)
        toast({
          title: "Erro",
          description: "Erro interno. Tente novamente ou entre em contato com o suporte.",
          variant: "destructive"
        })
        return false
      }

      const result = data as ResetResult
      console.log('✅ [SmartPasswordReset] Resultado:', result)

      if (result.success) {
        setResetCompleted(true)
        setResultMessage(result.message)
        
        toast({
          title: "Sucesso!",
          description: result.message,
          variant: "default"
        })
        
        return true
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive"
        })
        return false
      }

    } catch (error) {
      console.error('💥 [SmartPasswordReset] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setResetCompleted(false)
    setResultMessage('')
  }

  return {
    loading,
    resetCompleted,
    resultMessage,
    resetPassword,
    resetState
  }
}
