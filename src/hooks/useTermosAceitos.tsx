
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
        .select('termos_aceitos, data_aceite_termos, created_at')
        .eq('email_cliente', user.email)
        .maybeSingle()

      if (error) {
        console.error('❌ [useTermosAceitos] Erro ao verificar termos:', error)
        setTermosAceitos(false)
      } else if (data) {
        // Verificar se o cliente foi cadastrado antes de 24/06/2025
        const dataLimite = new Date('2025-06-24T00:00:00Z')
        const dataClienteCriacao = new Date(data.created_at)
        
        if (dataClienteCriacao < dataLimite) {
          console.log('✅ [useTermosAceitos] Cliente antigo - termos aceitos automaticamente')
          setTermosAceitos(true)
        } else {
          const aceitos = data.termos_aceitos || false
          console.log('✅ [useTermosAceitos] Cliente novo - verificando aceitação:', aceitos)
          setTermosAceitos(aceitos)
        }
      } else {
        // Se não encontrou perfil, verificar na tabela todos_clientes para determinar se é cliente antigo
        const { data: clienteData, error: clienteError } = await supabase
          .from('todos_clientes')
          .select('created_at')
          .eq('email_cliente', user.email)
          .maybeSingle()

        if (!clienteError && clienteData) {
          const dataLimite = new Date('2025-06-24T00:00:00Z')
          const dataClienteCriacao = new Date(clienteData.created_at)
          
          if (dataClienteCriacao < dataLimite) {
            console.log('✅ [useTermosAceitos] Cliente antigo encontrado em todos_clientes - termos aceitos automaticamente')
            setTermosAceitos(true)
          } else {
            console.log('⚠️ [useTermosAceitos] Cliente novo sem perfil criado - termos não aceitos')
            setTermosAceitos(false)
          }
        } else {
          console.log('⚠️ [useTermosAceitos] Cliente não encontrado - termos não aceitos')
          setTermosAceitos(false)
        }
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
