
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useTermosAceitos() {
  const { user } = useAuth()
  const [termosAceitos, setTermosAceitos] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  const checkTermosAceitos = async () => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    try {
      console.log('🔍 [useTermosAceitos] Verificando termos para:', user.email)
      
      const { data, error } = await supabase
        .from('cliente_profiles')
        .select('termos_aceitos, data_aceite_termos')
        .eq('email_cliente', user.email)
        .maybeSingle()

      if (error) {
        console.error('❌ [useTermosAceitos] Erro ao verificar termos:', error)
        setTermosAceitos(false)
      } else {
        const aceitos = data?.termos_aceitos || false
        console.log('✅ [useTermosAceitos] Termos aceitos:', aceitos)
        setTermosAceitos(aceitos)
      }
    } catch (error) {
      console.error('❌ [useTermosAceitos] Erro crítico:', error)
      setTermosAceitos(false)
    } finally {
      setLoading(false)
    }
  }

  const marcarTermosAceitos = () => {
    console.log('✅ [useTermosAceitos] Marcando termos como aceitos')
    setTermosAceitos(true)
  }

  useEffect(() => {
    checkTermosAceitos()
  }, [user?.email])

  return {
    termosAceitos,
    loading,
    marcarTermosAceitos,
    refetch: checkTermosAceitos
  }
}
