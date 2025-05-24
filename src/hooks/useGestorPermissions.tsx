
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useGestorPermissions() {
  const { user } = useAuth()
  const [canAddClients, setCanAddClients] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user?.email) {
        console.log('🔍 [useGestorPermissions] Sem email do usuário, definindo permissões como false')
        setCanAddClients(false)
        setLoading(false)
        return
      }

      try {
        console.log('🔍 [useGestorPermissions] Verificando permissões para:', user.email)
        
        const { data, error } = await supabase
          .from('gestores')
          .select('pode_adicionar_cliente, ativo, nome')
          .eq('email', user.email)
          .eq('ativo', true)
          .single()

        if (error) {
          console.warn('⚠️ [useGestorPermissions] Gestor não encontrado na tabela gestores:', error)
          console.log('🔍 [useGestorPermissions] Definindo permissões como false para email:', user.email)
          setCanAddClients(false)
        } else {
          console.log('✅ [useGestorPermissions] Permissões encontradas:', {
            nome: data.nome,
            email: user.email,
            pode_adicionar_cliente: data.pode_adicionar_cliente,
            ativo: data.ativo
          })
          setCanAddClients(data.pode_adicionar_cliente || false)
        }
      } catch (err) {
        console.error('💥 [useGestorPermissions] Erro ao verificar permissões:', err)
        setCanAddClients(false)
      } finally {
        setLoading(false)
      }
    }

    checkPermissions()
  }, [user?.email])

  console.log('🎯 [useGestorPermissions] Estado atual:', {
    userEmail: user?.email,
    canAddClients,
    loading
  })

  return { canAddClients, loading }
}
