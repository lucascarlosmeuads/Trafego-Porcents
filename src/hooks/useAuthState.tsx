
import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserType } from '@/types/auth'
import { checkUserType, getManagerName } from '@/utils/authHelpers'

interface UseAuthState {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  userType: UserType
  setUserType: React.Dispatch<React.SetStateAction<UserType>>
  isAdmin: boolean
  isGestor: boolean
  isCliente: boolean
  isVendedor: boolean
  isSites: boolean
  currentManagerName: string
  setCurrentManagerName: React.Dispatch<React.SetStateAction<string>>
  updateUserType: (email: string) => Promise<void>
  resetUserState: () => void
}

export function useAuthState(): UseAuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [userType, setUserType] = useState<UserType>('unauthorized')
  const [currentManagerName, setCurrentManagerName] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const resetUserState = useCallback(() => {
    console.log('🧹 [useAuthState] === RESETANDO ESTADO DO USUÁRIO ===')
    setUser(null)
    setUserType('unauthorized')
    setCurrentManagerName('')
    setLoading(false)
    setIsProcessing(false)
  }, [])

  const updateUserType = useCallback(async (email: string) => {
    // Prevenir múltiplas execuções simultâneas
    if (isProcessing) {
      console.log('⚠️ [useAuthState] updateUserType já em execução, ignorando...')
      return
    }

    console.log('🔍 [useAuthState] === DETERMINANDO TIPO DE USUÁRIO ===')
    console.log('🔍 [useAuthState] Email recebido:', `"${email}"`)
    
    setIsProcessing(true)
    
    try {
      console.log('🔄 [useAuthState] Chamando checkUserType...')
      const tipoUsuario = await checkUserType(email)
      console.log('✅ [useAuthState] Tipo determinado:', tipoUsuario)
      
      setUserType(tipoUsuario)

      // Buscar o nome do usuário
      console.log('🔄 [useAuthState] Buscando nome do usuário...')
      const nomeUsuario = await getManagerName(email)
      console.log('✅ [useAuthState] Nome encontrado:', nomeUsuario)
      setCurrentManagerName(nomeUsuario)

      // Log detalhado do resultado final
      console.log('🎯 [useAuthState] === RESULTADO FINAL ===')
      console.log('   - Email:', email)
      console.log('   - Tipo:', tipoUsuario)
      console.log('   - Nome:', nomeUsuario)
      console.log('   - Autorizado:', tipoUsuario !== 'unauthorized' && tipoUsuario !== 'error')

    } catch (error) {
      console.error('❌ [useAuthState] === ERRO CRÍTICO ===')
      console.error('❌ [useAuthState] Erro ao determinar tipo de usuário:', error)
      
      setUserType('error')
      setCurrentManagerName('')
    } finally {
      // CRÍTICO: Sempre finalizar loading e processing
      console.log('🏁 [useAuthState] Finalizando loading e processing...')
      setLoading(false)
      setIsProcessing(false)
    }
  }, [isProcessing])

  // Timeout de emergência mais curto
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (loading) {
        console.log('🚨 [useAuthState] === TIMEOUT DE EMERGÊNCIA ===')
        console.log('🚨 [useAuthState] Forçando fim do carregamento')
        setLoading(false)
        setIsProcessing(false)
      }
    }, 5000) // Reduzido para 5 segundos

    return () => clearTimeout(emergencyTimeout)
  }, [loading])

  // Computed properties
  const isAdmin = userType === 'admin'
  const isGestor = userType === 'gestor'
  const isCliente = userType === 'cliente'
  const isVendedor = userType === 'vendedor'
  const isSites = userType === 'sites'

  // Log simplificado do estado atual
  useEffect(() => {
    console.log('📊 [useAuthState] Estado:', { 
      loading, 
      userEmail: user?.email || 'null', 
      userType, 
      isProcessing 
    })
  }, [loading, user?.email, userType, isProcessing])

  return {
    user,
    setUser,
    loading,
    setLoading,
    userType,
    setUserType,
    isAdmin,
    isGestor,
    isCliente,
    isVendedor,
    isSites,
    currentManagerName,
    setCurrentManagerName,
    updateUserType,
    resetUserState
  }
}
