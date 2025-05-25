
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { checkUserType, getManagerName } from '@/utils/authHelpers'

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGestor, setIsGestor] = useState(false)
  const [isCliente, setIsCliente] = useState(false)
  const [currentManagerName, setCurrentManagerName] = useState('')

  const isAdmin = user?.email === 'lucas@admin.com'

  const updateUserType = async (email: string) => {
    console.log('🔍 [useAuthState] Atualizando tipo de usuário para:', email)
    
    if (email === 'lucas@admin.com') {
      console.log('🔍 [useAuthState] Usuário é ADMIN')
      setIsGestor(false)
      setIsCliente(false)
      setCurrentManagerName('Administrador')
      return
    }

    const userType = await checkUserType(email)
    
    switch (userType) {
      case 'gestor':
        setIsGestor(true)
        setIsCliente(false)
        const managerName = await getManagerName(email)
        setCurrentManagerName(managerName)
        break
      case 'cliente':
        setIsGestor(false)
        setIsCliente(true)
        setCurrentManagerName('')
        break
      default:
        setIsGestor(false)
        setIsCliente(false)
        setCurrentManagerName('')
        break
    }
  }

  const resetUserState = () => {
    console.log('🧹 [useAuthState] Resetando estado do usuário')
    setIsGestor(false)
    setIsCliente(false)
    setCurrentManagerName('')
  }

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
