
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useTermosAceitos() {
  const { user } = useAuth()
  const [termosAceitos, setTermosAceitos] = useState<boolean | null>(null)
  const [clienteAntigo, setClienteAntigo] = useState<boolean | null>(null)
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
        setClienteAntigo(false)
      } else if (data) {
        // Verificar se o cliente foi cadastrado antes de 24/06/2025
        const dataLimite = new Date('2025-06-24T00:00:00Z')
        const dataClienteCriacao = new Date(data.created_at)
        
        if (dataClienteCriacao < dataLimite) {
          console.log('✅ [useTermosAceitos] Cliente antigo - não precisa aceitar termos')
          setClienteAntigo(true)
          setTermosAceitos(true) // Para compatibilidade, mas não será usado na UI
        } else {
          console.log('✅ [useTermosAceitos] Cliente novo - verificando aceitação:', data.termos_aceitos)
          setClienteAntigo(false)
          setTermosAceitos(data.termos_aceitos || false)
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
            console.log('✅ [useTermosAceitos] Cliente antigo encontrado em todos_clientes')
            setClienteAntigo(true)
            setTermosAceitos(true) // Para compatibilidade
          } else {
            console.log('⚠️ [useTermosAceitos] Cliente novo sem perfil criado - termos não aceitos')
            setClienteAntigo(false)
            setTermosAceitos(false)
          }
        } else {
          console.log('⚠️ [useTermosAceitos] Cliente não encontrado - assumindo cliente novo')
          setClienteAntigo(false)
          setTermosAceitos(false)
        }
      }
    } catch (error) {
      console.error('❌ [useTermosAceitos] Erro crítico:', error)
      setTermosAceitos(false)
      setClienteAntigo(false)
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
    clienteAntigo,
    loading,
    marcarTermosAceitos,
    refetch: checkTermosAceitos
  }
}
