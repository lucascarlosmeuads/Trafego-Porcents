
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useTermosAceitos() {
  const { user } = useAuth()
  const [termosAceitos, setTermosAceitos] = useState<boolean | null>(null)
  const [termosRejeitados, setTermosRejeitados] = useState<boolean | null>(null)
  const [clienteAntigo, setClienteAntigo] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkTermosAceitos = async () => {
    if (!user?.email) {
      console.log('⚠️ [useTermosAceitos] Sem usuário, definindo estados padrão')
      setTermosAceitos(false)
      setTermosRejeitados(false)
      setClienteAntigo(false)
      setLoading(false)
      return
    }

    try {
      console.log('🔍 [useTermosAceitos] === VERIFICAÇÃO OTIMIZADA ===')
      console.log('🔍 [useTermosAceitos] Email:', user.email)
      
      // Timeout para evitar loading infinito
      const timeoutId = setTimeout(() => {
        console.log('⏰ [useTermosAceitos] Timeout - assumindo cliente antigo')
        setClienteAntigo(true)
        setTermosAceitos(true)
        setTermosRejeitados(false)
        setLoading(false)
      }, 8000)

      const { data, error } = await supabase
        .from('cliente_profiles')
        .select('termos_aceitos, termos_rejeitados, data_aceite_termos, data_rejeicao_termos, created_at')
        .eq('email_cliente', user.email)
        .maybeSingle()

      clearTimeout(timeoutId)

      if (error) {
        console.error('❌ [useTermosAceitos] Erro na consulta:', error)
        // Em caso de erro, assumir cliente antigo para não bloquear
        setClienteAntigo(true)
        setTermosAceitos(true)
        setTermosRejeitados(false)
        setError('Erro ao verificar termos - assumindo acesso liberado')
      } else if (data) {
        console.log('✅ [useTermosAceitos] Dados encontrados:', data)
        
        // Verificar se é cliente antigo (antes de 24/06/2025)
        const dataLimite = new Date('2025-06-24T00:00:00Z')
        const dataClienteCriacao = new Date(data.created_at)
        
        if (dataClienteCriacao < dataLimite) {
          console.log('👴 [useTermosAceitos] Cliente antigo detectado')
          setClienteAntigo(true)
          setTermosAceitos(true)
          setTermosRejeitados(false)
        } else {
          console.log('👶 [useTermosAceitos] Cliente novo - verificando termos')
          setClienteAntigo(false)
          setTermosAceitos(Boolean(data.termos_aceitos))
          setTermosRejeitados(Boolean(data.termos_rejeitados))
        }
      } else {
        console.log('🔍 [useTermosAceitos] Nenhum perfil encontrado - verificando todos_clientes')
        
        // Verificar na tabela todos_clientes se não encontrou no profiles
        const { data: clienteData, error: clienteError } = await supabase
          .from('todos_clientes')
          .select('created_at')
          .eq('email_cliente', user.email)
          .maybeSingle()

        if (!clienteError && clienteData) {
          const dataLimite = new Date('2025-06-24T00:00:00Z')
          const dataClienteCriacao = new Date(clienteData.created_at)
          
          if (dataClienteCriacao < dataLimite) {
            console.log('👴 [useTermosAceitos] Cliente antigo encontrado em todos_clientes')
            setClienteAntigo(true)
            setTermosAceitos(true)
            setTermosRejeitados(false)
          } else {
            console.log('👶 [useTermosAceitos] Cliente novo sem perfil')
            setClienteAntigo(false)
            setTermosAceitos(false)
            setTermosRejeitados(false)
          }
        } else {
          console.log('⚠️ [useTermosAceitos] Cliente não encontrado - assumindo cliente antigo')
          // Se não encontrou em lugar nenhum, assumir cliente antigo para não bloquear
          setClienteAntigo(true)
          setTermosAceitos(true)
          setTermosRejeitados(false)
        }
      }
    } catch (error) {
      console.error('❌ [useTermosAceitos] Erro crítico:', error)
      // Em caso de erro crítico, assumir cliente antigo para não bloquear
      setClienteAntigo(true)
      setTermosAceitos(true)
      setTermosRejeitados(false)
      setError('Erro crítico - assumindo acesso liberado')
    } finally {
      setLoading(false)
    }
  }

  const marcarTermosAceitos = () => {
    console.log('✅ [useTermosAceitos] Marcando termos como aceitos')
    setTermosAceitos(true)
    setTermosRejeitados(false)
    setError(null)
  }

  const marcarTermosRejeitados = () => {
    console.log('❌ [useTermosAceitos] Marcando termos como rejeitados')
    setTermosRejeitados(true)
    setTermosAceitos(false)
    setError(null)
  }

  useEffect(() => {
    checkTermosAceitos()
  }, [user?.email])

  return {
    termosAceitos,
    termosRejeitados,
    clienteAntigo,
    loading,
    error,
    marcarTermosAceitos,
    marcarTermosRejeitados,
    refetch: checkTermosAceitos
  }
}
