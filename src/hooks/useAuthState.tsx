
import { useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { checkUserType, getManagerName } from '@/utils/authHelpers'

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGestor, setIsGestor] = useState(false)
  const [isCliente, setIsCliente] = useState(false)
  const [isVendedor, setIsVendedor] = useState(false)
  const [currentManagerName, setCurrentManagerName] = useState('')

  const isAdmin = user?.email?.includes('@admin') || false

  const updateUserType = useCallback(async (email: string) => {
    console.log('🚀 [useAuthState] === INICIANDO VERIFICAÇÃO SIMPLIFICADA ===')
    console.log('🚀 [useAuthState] Email:', email)
    
    // Reset inicial
    setIsGestor(false)
    setIsCliente(false)
    setIsVendedor(false)
    setCurrentManagerName('')
    
    if (email.includes('@admin')) {
      console.log('👑 [useAuthState] ADMIN detectado')
      setCurrentManagerName('Administrador')
      return
    }

    try {
      console.log('🔄 [useAuthState] Chamando checkUserType...')
      const userType = await checkUserType(email)
      console.log('🎯 [useAuthState] RESULTADO:', userType)
      
      switch (userType) {
        case 'gestor':
          console.log('👨‍💼 [useAuthState] Configurando GESTOR')
          setIsGestor(true)
          setIsCliente(false)
          setIsVendedor(false)
          const managerName = await getManagerName(email)
          setCurrentManagerName(managerName)
          break
          
        case 'vendedor':
          console.log('💼 [useAuthState] === CONFIGURANDO VENDEDOR ===')
          setIsGestor(false)
          setIsCliente(false)
          setIsVendedor(true)
          setCurrentManagerName('Vendedor')
          console.log('✅ [useAuthState] Vendedor configurado com sucesso!')
          break
          
        case 'cliente':
          console.log('👤 [useAuthState] === CONFIGURANDO CLIENTE ===')
          setIsGestor(false)
          setIsCliente(true)
          setIsVendedor(false)
          setCurrentManagerName('')
          console.log('✅ [useAuthState] Cliente configurado com sucesso!')
          break
          
        default:
          console.log('❓ [useAuthState] Tipo desconhecido, configurando como cliente')
          setIsGestor(false)
          setIsCliente(true)
          setIsVendedor(false)
          setCurrentManagerName('')
          break
      }
      
      console.log('📊 [useAuthState] === ESTADO FINAL ===')
      console.log('   - userType:', userType)
      console.log('   - isAdmin:', email.includes('@admin'))
      console.log('   - isGestor:', userType === 'gestor')
      console.log('   - isVendedor:', userType === 'vendedor')
      console.log('   - isCliente:', userType === 'cliente')
      
    } catch (error) {
      console.error('💥 [useAuthState] ERRO:', error)
      // Em caso de erro, considerar como cliente
      setIsGestor(false)
      setIsCliente(true)
      setIsVendedor(false)
      setCurrentManagerName('')
    }
  }, [])

  const resetUserState = useCallback(() => {
    console.log('🧹 [useAuthState] Resetando estado')
    setIsGestor(false)
    setIsCliente(false)
    setIsVendedor(false)
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
    isVendedor,
    currentManagerName,
    updateUserType,
    resetUserState
  }
}
