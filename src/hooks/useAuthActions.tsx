
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthState } from '@/hooks/useAuthState'

export function useAuthActions() {
  const { resetUserState, setLoading } = useAuthState()
  
  const signIn = async (email: string, password: string) => {
    console.log('🔐 [useAuthActions] === PROCESSO DE LOGIN ===')
    console.log('📧 [useAuthActions] Email:', email)
    
    setLoading(true)
    
    try {
      // Limpar estado anterior antes de fazer login
      console.log('🧹 [useAuthActions] Limpando estado anterior...')
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        console.error('❌ [useAuthActions] Falha na autenticação:', error.message)
        setLoading(false)
        return { error }
      }
      
      if (data.user) {
        console.log('✅ [useAuthActions] Login bem-sucedido para:', data.user.email)
        console.log('⏳ [useAuthActions] Aguardando determinação de tipo...')
        // NÃO definir loading como false aqui - deixar o useAuthListener fazer isso
      }
      
      return { error: null }
    } catch (error) {
      console.error('❌ [useAuthActions] Erro inesperado no login:', error)
      setLoading(false)
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    console.log('🔐 [useAuthActions] === PROCESSO DE CADASTRO ===')
    console.log('📧 [useAuthActions] Email:', email)
    
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      })
      
      if (error) {
        console.error('❌ [useAuthActions] Erro no cadastro:', error.message)
        setLoading(false)
        return { error }
      }
      
      if (data.user) {
        console.log('✅ [useAuthActions] Cadastro bem-sucedido para:', data.user.email)
      }
      
      return { error: null }
    } catch (error) {
      console.error('❌ [useAuthActions] Erro inesperado no cadastro:', error)
      setLoading(false)
      return { error }
    }
  }

  const signOut = async () => {
    console.log('🚪 [useAuthActions] === PROCESSO DE LOGOUT ===')
    
    try {
      console.log('🧹 [useAuthActions] Limpando estado local primeiro')
      resetUserState()
      
      console.log('🗑️ [useAuthActions] Limpando localStorage')
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase') || key.includes('sb-') || key.includes('auth')) {
          localStorage.removeItem(key)
        }
      })
      
      console.log('🚪 [useAuthActions] Fazendo logout no Supabase')
      await supabase.auth.signOut({ scope: 'global' })
      
      console.log('✅ [useAuthActions] Logout concluído, redirecionando...')
      
      // Redirecionamento mais rápido
      setTimeout(() => {
        window.location.href = '/'
      }, 50)
      
    } catch (error) {
      console.error('❌ [useAuthActions] Erro no logout:', error)
      // Forçar redirecionamento mesmo com erro
      window.location.href = '/'
    }
  }

  return {
    signIn,
    signUp,
    signOut
  }
}
