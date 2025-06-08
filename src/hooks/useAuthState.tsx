
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
  isRelatorios: boolean
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
    console.log('🧹 [useAuthState] Resetando estado do usuário')
    setUser(null)
    setUserType('unauthorized')
    setCurrentManagerName('')
  }, [setUser, setUserType, setCurrentManagerName])

  const updateUserType = useCallback(async (email: string) => {
    console.log('🔍 [useAuthState] === DETERMINANDO TIPO DE USUÁRIO ===')
    console.log('🔍 [useAuthState] Email recebido:', `"${email}"`)
    
    try {
      console.log('🔄 [useAuthState] Chamando checkUserType...')
      const tipoUsuario = await checkUserType(email)
      console.log('✅ [useAuthState] Tipo determinado:', tipoUsuario)
      
      console.log('📊 [useAuthState] === ATUALIZANDO ESTADO ===')
      console.log('📊 [useAuthState] Setando userType para:', tipoUsuario)
      setUserType(tipoUsuario)

      // Buscar o nome do usuário
      console.log('🔄 [useAuthState] Buscando nome do usuário...')
      const nomeUsuario = await getManagerName(email)
      console.log('✅ [useAuthState] Nome encontrado:', nomeUsuario)
      setCurrentManagerName(nomeUsuario)

      // Log final do resultado
      console.log('🎯 [useAuthState] RESULTADO FINAL:')
      console.log('   - Email:', email)
      console.log('   - Tipo:', tipoUsuario)
      console.log('   - Nome:', nomeUsuario)
      console.log('   - Acesso autorizado:', tipoUsuario !== 'unauthorized' && tipoUsuario !== 'error')

      // LOG ESPECÍFICO PARA RELATÓRIOS
      if (tipoUsuario === 'relatorios') {
        console.log('📊 [useAuthState] 🎉 USUÁRIO DE RELATÓRIOS CONFIRMADO!')
        console.log('📊 [useAuthState] ✅ Deve ter acesso ao painel /admin-relatorios')
        console.log('📊 [useAuthState] 🔗 Para acessar: navegue diretamente para /admin-relatorios')
      }

    } catch (error) {
      console.error('❌ [useAuthState] Erro CRÍTICO ao determinar tipo de usuário:', error)
      setUserType('error')
      setCurrentManagerName('')
    }
  }, [])

  // Computed properties
  const isAdmin = userType === 'admin'
  const isGestor = userType === 'gestor'
  const isCliente = userType === 'cliente'
  const isVendedor = userType === 'vendedor'
  const isSites = userType === 'sites'
  const isRelatorios = userType === 'relatorios'

  // Debug dos tipos computados
  useEffect(() => {
    if (user?.email) {
      console.log('🔍 [useAuthState] === STATUS ATUAL ===')
      console.log('🔍 [useAuthState] Email logado:', user.email)
      console.log('🔍 [useAuthState] userType:', userType)
      console.log('🔍 [useAuthState] isRelatorios:', isRelatorios)
      
      if (user.email.includes('@relatorios.com')) {
        console.log('📊 [useAuthState] 🎯 USUÁRIO @relatorios.com DETECTADO!')
        console.log('📊 [useAuthState] ✅ Deveria ter acesso total ao /admin-relatorios')
        console.log('📊 [useAuthState] 🔧 isRelatorios atual:', isRelatorios)
        
        if (!isRelatorios && userType !== 'relatorios') {
          console.log('⚠️ [useAuthState] PROBLEMA: Usuário @relatorios.com NÃO está sendo reconhecido!')
          console.log('⚠️ [useAuthState] Forçando re-verificação...')
          setTimeout(() => updateUserType(user.email), 100)
        }
      }
    }
  }, [user, userType, isRelatorios, updateUserType])

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
    isRelatorios,
    currentManagerName,
    setCurrentManagerName,
    updateUserType,
    resetUserState
  }
}
