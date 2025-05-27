
import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserType } from '@/types/auth'

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
    setUser(null)
    setUserType('unauthorized')
    setCurrentManagerName('')
  }, [setUser, setUserType, setCurrentManagerName])

  const updateUserType = useCallback(async (email: string) => {
    console.log('🔍 [useAuthState] Determinando tipo de usuário para:', email)
    
    try {
      // Verificação hierárquica de tipos de usuário
      if (email.includes('@admin')) {
        console.log('👑 [useAuthState] Usuário identificado como ADMIN')
        setUserType('admin')
        setCurrentManagerName('Administrador')
        return
      }

      // NOVO: Verificar se é responsável por sites
      if (email.includes('sites') || email.includes('site@') || email.includes('webdesign')) {
        console.log('🌐 [useAuthState] Usuário identificado como RESPONSÁVEL POR SITES')
        setUserType('sites')
        setCurrentManagerName('Responsável por Sites')
        return
      }

      if (email.startsWith('vendedor') && email.includes('@trafegoporcents.com')) {
        console.log('💼 [useAuthState] Usuário identificado como VENDEDOR')
        setUserType('vendedor')
        
        const nomeVendedor = email.split('@')[0].replace('vendedor', '').toLowerCase()
        const nomeFormatado = nomeVendedor.charAt(0).toUpperCase() + nomeVendedor.slice(1)
        setCurrentManagerName(nomeFormatado || 'Vendedor')
        return
      }

      // CORREÇÃO: Verificar na tabela de gestores PRIMEIRO antes de verificar clientes
      console.log('🔍 [useAuthState] Verificando se é gestor na tabela gestores...')
      const { data: gestor, error: gestorError } = await supabase
        .from('gestores')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .single()

      if (gestorError && gestorError.code !== 'PGRST116') {
        console.error('❌ [useAuthState] Erro ao buscar gestor:', gestorError)
      } else if (gestor) {
        console.log('👨‍💼 [useAuthState] Usuário autenticado como GESTOR:', gestor.nome)
        setUserType('gestor')
        setCurrentManagerName(gestor.nome || 'Gestor')
        return
      }

      // Se não for gestor, verificar na tabela de clientes
      console.log('🔍 [useAuthState] Não é gestor, verificando se é cliente...')
      const { data: cliente, error: clienteError } = await supabase
        .from('todos_clientes')
        .select('*')
        .eq('email_cliente', email)
        .single()

      if (clienteError && clienteError.code !== 'PGRST116') {
        console.warn('⚠️ [useAuthState] Cliente não encontrado:', email)
      } else if (cliente) {
        console.log('👤 [useAuthState] Usuário autenticado como CLIENTE:', cliente.nome_cliente)
        setUserType('cliente')
        setCurrentManagerName(cliente.nome_cliente || 'Cliente')
        return
      }

      console.warn('❌ [useAuthState] Tipo de usuário não determinado para:', email)
      setUserType('unauthorized')
      setCurrentManagerName('')

    } catch (error) {
      console.error('❌ [useAuthState] Erro ao determinar tipo de usuário:', error)
      setUserType('error')
      setCurrentManagerName('')
    }
  }, [])

  // Computed properties - ATUALIZADO para incluir isSites
  const isAdmin = userType === 'admin'
  const isGestor = userType === 'gestor'
  const isCliente = userType === 'cliente'
  const isVendedor = userType === 'vendedor'
  const isSites = userType === 'sites'

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
