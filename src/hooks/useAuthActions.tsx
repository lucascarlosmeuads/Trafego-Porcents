
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthState } from '@/hooks/useAuthState'

export function useAuthActions() {
  const { resetUserState, setLoading } = useAuthState()
  
  const signIn = async (email: string, password: string) => {
    console.log('🔐 [useAuthActions] === PROCESSO DE LOGIN ===')
    console.log('📧 [useAuthActions] Email:', email)
    console.log('🔍 [useAuthActions] Validação baseada APENAS no Supabase Auth')
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        console.error('❌ [useAuthActions] Falha na autenticação Supabase:', error.message)
        console.error('🔥 [useAuthActions] Código do erro:', error.code)
        setLoading(false)
        return { error }
      }
      
      if (data.user) {
        console.log('✅ [useAuthActions] Login bem-sucedido para:', data.user.email)
        console.log('🎯 [useAuthActions] Usuário autenticado via Supabase Auth')
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
    console.log('🔍 [useAuthActions] Validação baseada APENAS no Supabase Auth')
    console.log('❌ [useAuthActions] NÃO verificando todos_clientes ou outras tabelas')
    
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      })
      
      if (error) {
        console.error('❌ [useAuthActions] Erro no cadastro Supabase:', error.message)
        console.error('🔥 [useAuthActions] Código do erro:', error.code)
        setLoading(false)
        return { error }
      }
      
      if (data.user) {
        console.log('✅ [useAuthActions] Cadastro bem-sucedido para:', data.user.email)
        console.log('🎯 [useAuthActions] Conta criada no Supabase Auth')
      }
      
      setLoading(false)
      return { error: null }
    } catch (error) {
      console.error('❌ [useAuthActions] Erro inesperado no cadastro:', error)
      setLoading(false)
      return { error }
    }
  }

  const signOut = async () => {
    console.log('🚪 [useAuthActions] === PROCESSO DE LOGOUT ===')
    setLoading(true)
    
    try {
      console.log('🧹 [useAuthActions] Limpando estado local primeiro')
      resetUserState()
      
      console.log('🗑️ [useAuthActions] Limpando localStorage')
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          console.log('🗑️ [useAuthActions] Removendo:', key)
          localStorage.removeItem(key)
        }
      })
      
      console.log('🚪 [useAuthActions] Fazendo logout no Supabase')
      await supabase.auth.signOut({ scope: 'global' })
      
      console.log('✅ [useAuthActions] Logout concluído, redirecionando...')
      
      // Forçar reload da página para limpar completamente o estado
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('❌ [useAuthActions] Erro no logout:', error)
      // Em caso de erro, forçar redirecionamento mesmo assim
      console.log('🚪 [useAuthActions] Forçando redirecionamento por erro')
      window.location.href = '/'
    }
  }

  return {
    signIn,
    signUp,
    signOut
  }
}
