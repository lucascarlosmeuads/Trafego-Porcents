
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { clearTokensFromUrl, validatePassword } from '@/utils/passwordResetHelpers'

export function usePasswordReset() {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const sendResetEmail = async (email: string) => {
    setLoading(true)
    console.log('📧 [PasswordReset] Enviando email de recuperação para:', email)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://login.trafegoporcents.com/reset-password',
      })

      if (error) {
        console.error('❌ [PasswordReset] Erro ao enviar email:', error)
        
        let errorMessage = 'Erro ao enviar email de recuperação'
        if (error.message.includes('rate limit')) {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
        } else if (error.message.includes('not found')) {
          errorMessage = 'Email não encontrado no sistema'
        }

        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        })
        return false
      }

      console.log('✅ [PasswordReset] Email enviado com sucesso')
      setEmailSent(true)
      toast({
        title: "Email Enviado",
        description: "Verifique sua caixa de entrada para o link de recuperação"
      })
      return true

    } catch (error) {
      console.error('💥 [PasswordReset] Erro inesperado:', error)
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

  const resetPassword = async (newPassword: string, confirmPassword: string) => {
    setLoading(true)
    console.log('🔐 [PasswordReset] Iniciando processo de redefinição de senha')

    try {
      // Validar senhas
      if (newPassword !== confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem",
          variant: "destructive"
        })
        return false
      }

      const passwordValidation = validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        toast({
          title: "Senha Inválida",
          description: passwordValidation.message,
          variant: "destructive"
        })
        return false
      }

      console.log('🔑 [PasswordReset] Validações passaram, atualizando senha...')

      // Atualizar a senha (a sessão já foi configurada no componente)
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        console.error('❌ [PasswordReset] Erro ao atualizar senha:', updateError)
        toast({
          title: "Erro",
          description: "Não foi possível redefinir a senha. Tente novamente.",
          variant: "destructive"
        })
        return false
      }

      console.log('✅ [PasswordReset] Senha redefinida com sucesso')
      
      // Limpar tokens da URL
      clearTokensFromUrl()

      toast({
        title: "Sucesso",
        description: "Senha redefinida com sucesso! Redirecionando..."
      })

      // Redirecionamento será tratado pelo useAuth quando detectar o usuário logado
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)

      return true

    } catch (error) {
      console.error('💥 [PasswordReset] Erro inesperado:', error)
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

  return {
    loading,
    emailSent,
    sendResetEmail,
    resetPassword,
    setEmailSent
  }
}
