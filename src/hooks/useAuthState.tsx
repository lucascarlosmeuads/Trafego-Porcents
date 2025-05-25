
import { useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { checkUserType, getManagerName } from '@/utils/authHelpers'

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGestor, setIsGestor] = useState(false)
  const [isCliente, setIsCliente] = useState(false)
  const [currentManagerName, setCurrentManagerName] = useState('')

  const isAdmin = user?.email === 'lucas@admin.com'

  // Otimizar updateUserType com useCallback e timeout de segurança
  const updateUserType = useCallback(async (email: string) => {
    console.log('🔍 [useAuthState] Atualizando tipo de usuário para:', email)
    
    if (email === 'lucas@admin.com') {
      console.log('🔍 [useAuthState] Usuário é ADMIN')
      setIsGestor(false)
      setIsCliente(false)
      setCurrentManagerName('Administrador')
      return
    }

    try {
      // Timeout de segurança para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na verificação de usuário')), 10000)
      )
      
      const userTypePromise = checkUserType(email)
      
      const userType = await Promise.race([userTypePromise, timeoutPromise]) as string
      
      console.log('🎯 [useAuthState] Tipo de usuário determinado:', userType)
      
      switch (userType) {
        case 'gestor':
          setIsGestor(true)
          setIsCliente(false)
          const managerName = await getManagerName(email)
          setCurrentManagerName(managerName)
          console.log('✅ [useAuthState] Definido como GESTOR:', managerName)
          break
        case 'cliente':
          setIsGestor(false)
          setIsCliente(true)
          setCurrentManagerName('')
          console.log('✅ [useAuthState] Definido como CLIENTE')
          break
        default:
          setIsGestor(false)
          setIsCliente(false)
          setCurrentManagerName('')
          console.log('❌ [useAuthState] Usuário sem permissão:', userType)
          break
      }
    } catch (error) {
      console.error('❌ [useAuthState] Erro ao determinar tipo de usuário:', error)
      // Em caso de erro, não deixar o usuário travado
      setIsGestor(false)
      setIsCliente(false)
      setCurrentManagerName('')
    }
  }, [])

  const resetUserState = useCallback(() => {
    console.log('🧹 [useAuthState] Resetando estado do usuário')
    setIsGestor(false)
    setIsCliente(false)
    setCurrentManagerName('')
  }, [])

  return {
    user,
    setUser,
    loading,
    setLoading,
    isAdmin,
    isGestor,
    isCliente,
    currentManagerName,
    updateUserType,
    resetUserState
  }
}
