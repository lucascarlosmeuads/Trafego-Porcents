
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

  const updateUserType = useCallback(async (email: string) => {
    console.log('🔍 [useAuthState] === INICIANDO VERIFICAÇÃO DE TIPO ===')
    console.log('🔍 [useAuthState] Email recebido:', `"${email}"`)
    
    // Reset todos os estados primeiro
    setIsGestor(false)
    setIsCliente(false)
    setCurrentManagerName('')
    
    if (email === 'lucas@admin.com') {
      console.log('🔍 [useAuthState] Usuário é ADMIN (hardcoded)')
      setCurrentManagerName('Administrador')
      return
    }

    try {
      const startTime = Date.now()
      console.log('🔍 [useAuthState] Chamando checkUserType...')
      
      const userType = await checkUserType(email)
      
      const endTime = Date.now()
      console.log(`🔍 [useAuthState] checkUserType completou em ${endTime - startTime}ms`)
      console.log('🎯 [useAuthState] === RESULTADO FINAL ===')
      console.log('🎯 [useAuthState] Tipo determinado:', userType)
      
      switch (userType) {
        case 'gestor':
          console.log('✅ [useAuthState] Configurando como GESTOR')
          setIsGestor(true)
          setIsCliente(false)
          const managerName = await getManagerName(email)
          setCurrentManagerName(managerName)
          console.log('✅ [useAuthState] Nome do gestor:', managerName)
          break
          
        case 'cliente':
          console.log('✅ [useAuthState] === CONFIGURANDO COMO CLIENTE ===')
          console.log('🎯 [useAuthState] *** DEFININDO ESTADO DO CLIENTE ***')
          setIsGestor(false)
          setIsCliente(true)
          setCurrentManagerName('')
          console.log('✅ [useAuthState] Estado do cliente configurado:')
          console.log('   - isGestor: false')
          console.log('   - isCliente: true')
          console.log('   - currentManagerName: ""')
          
          // Verificação adicional para garantir que foi setado
          setTimeout(() => {
            console.log('🔄 [useAuthState] Verificação pós-setTimeout:')
            console.log('   - isCliente deve ser true')
          }, 100)
          break
          
        case 'unauthorized':
          console.log('❌ [useAuthState] === USUÁRIO SEM PERMISSÃO ===')
          console.log('❌ [useAuthState] Email:', email, 'não encontrado nas tabelas permitidas')
          setIsGestor(false)
          setIsCliente(false)
          setCurrentManagerName('')
          break
          
        case 'error':
          console.log('❌ [useAuthState] ERRO na verificação')
          setIsGestor(false)
          setIsCliente(false)
          setCurrentManagerName('')
          break
          
        default:
          console.log('❌ [useAuthState] Tipo desconhecido:', userType)
          setIsGestor(false)
          setIsCliente(false)
          setCurrentManagerName('')
          break
      }
      
      console.log('🔍 [useAuthState] === ESTADO FINAL CONFIGURADO ===')
      console.log('🔍 [useAuthState] isAdmin:', email === 'lucas@admin.com')
      console.log('🔍 [useAuthState] isGestor:', userType === 'gestor')
      console.log('🔍 [useAuthState] isCliente:', userType === 'cliente')
      console.log('🔍 [useAuthState] Qual painel será exibido:', 
        userType === 'cliente' ? 'PAINEL DE CLIENTE ✅' :
        userType === 'gestor' ? 'PAINEL DE GESTOR' :
        email === 'lucas@admin.com' ? 'PAINEL DE ADMIN' :
        'TELA DE ACESSO NEGADO ❌'
      )
      
    } catch (error) {
      console.error('❌ [useAuthState] === ERRO CRÍTICO ===')
      console.error('❌ [useAuthState] Erro ao determinar tipo de usuário:', error)
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
