
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

  const resetUserState = useCallback(() => {
    console.log('🧹 [useAuthState] === RESETANDO ESTADO DO USUÁRIO ===')
    setUser(null)
    setUserType('unauthorized')
    setCurrentManagerName('')
    setLoading(false)
  }, [])

  const updateUserType = useCallback(async (email: string) => {
    console.log('🔍 [useAuthState] === DETERMINANDO TIPO DE USUÁRIO ===')
    console.log('🔍 [useAuthState] Email recebido:', `"${email}"`)
    console.log('🔍 [useAuthState] Iniciando processo de verificação...')
    
    try {
      console.log('🔄 [useAuthState] Chamando checkUserType...')
      const tipoUsuario = await checkUserType(email)
      console.log('✅ [useAuthState] Tipo determinado:', tipoUsuario)
      
      // Verificação específica para o problema atual
      if (tipoUsuario === 'unauthorized' || tipoUsuario === 'error') {
        console.log('❌ [useAuthState] PROBLEMA DETECTADO - Usuário não autorizado')
        console.log('🔧 [useAuthState] Verificando se é problema de dados...')
      }
      
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
      console.log('   - Deve mostrar dashboard:', tipoUsuario !== 'unauthorized' && tipoUsuario !== 'error')

      // IMPORTANTE: Sempre finalizar o loading após determinar o tipo
      console.log('🏁 [useAuthState] Finalizando loading...')
      setLoading(false)

    } catch (error) {
      console.error('❌ [useAuthState] === ERRO CRÍTICO ===')
      console.error('❌ [useAuthState] Erro ao determinar tipo de usuário:', error)
      console.error('❌ [useAuthState] Stack trace:', error instanceof Error ? error.stack : 'N/A')
      
      setUserType('error')
      setCurrentManagerName('')
      setLoading(false) // CRÍTICO: Sempre finalizar loading mesmo em erro
    }
  }, [])

  // Timeout de emergência com logs mais detalhados
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (loading) {
        console.log('🚨 [useAuthState] === TIMEOUT DE EMERGÊNCIA ===')
        console.log('🚨 [useAuthState] Loading ainda estava true após 10 segundos')
        console.log('🚨 [useAuthState] Estado atual:')
        console.log('   - user:', user?.email || 'null')
        console.log('   - userType:', userType)
        console.log('   - currentManagerName:', currentManagerName)
        console.log('🚨 [useAuthState] Forçando fim do carregamento')
        setLoading(false)
      }
    }, 10000) // Reduzido para 10 segundos

    return () => clearTimeout(emergencyTimeout)
  }, [loading, user, userType, currentManagerName])

  // Computed properties com logs
  const isAdmin = userType === 'admin'
  const isGestor = userType === 'gestor'
  const isCliente = userType === 'cliente'
  const isVendedor = userType === 'vendedor'
  const isSites = userType === 'sites'

  // Log do estado atual sempre que houver mudanças
  useEffect(() => {
    console.log('📊 [useAuthState] === ESTADO ATUAL ===')
    console.log('   - loading:', loading)
    console.log('   - user:', user?.email || 'null')
    console.log('   - userType:', userType)
    console.log('   - isGestor:', isGestor)
    console.log('   - currentManagerName:', currentManagerName)
  }, [loading, user, userType, isGestor, currentManagerName])

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
