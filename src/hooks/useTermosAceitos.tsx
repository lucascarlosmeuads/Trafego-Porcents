
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useTermosAceitos() {
  const { user } = useAuth()
  const [termosAceitos, setTermosAceitos] = useState<boolean | null>(null)
  const [termosRejeitados, setTermosRejeitados] = useState<boolean | null>(null)
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
        .select('termos_aceitos, termos_rejeitados, data_aceite_termos, data_rejeicao_termos, created_at')
        .eq('email_cliente', user.email)
        .maybeSingle()

      if (error) {
        console.error('❌ [useTermosAceitos] Erro ao verificar termos:', error)
        setTermosAceitos(false)
        setTermosRejeitados(false)
        setClienteAntigo(false)
      } else if (data) {
        // Verificar se o cliente foi cadastrado antes ou até 24/06/2025 (inclusive)
        const dataLimite = new Date('2025-06-24T23:59:59Z')
        const dataClienteCriacao = new Date(data.created_at)
        
        if (dataClienteCriacao <= dataLimite) {
          console.log('✅ [useTermosAceitos] Cliente antigo - não precisa aceitar termos')
          setClienteAntigo(true)
          setTermosAceitos(true) // Para compatibilidade, mas não será usado na UI
          setTermosRejeitados(false)
        } else {
          console.log('✅ [useTermosAceitos] Cliente novo - verificando aceitação/rejeição')
          setClienteAntigo(false)
          setTermosAceitos(data.termos_aceitos || false)
          setTermosRejeitados(data.termos_rejeitados || false)
        }
      } else {
        // Se não encontrou perfil, verificar na tabela todos_clientes para determinar se é cliente antigo
        const { data: clienteData, error: clienteError } = await supabase
          .from('todos_clientes')
          .select('created_at')
          .eq('email_cliente', user.email)
          .maybeSingle()

        if (!clienteError && clienteData) {
          const dataLimite = new Date('2025-06-24T23:59:59Z')
          const dataClienteCriacao = new Date(clienteData.created_at)
          
          if (dataClienteCriacao <= dataLimite) {
            console.log('✅ [useTermosAceitos] Cliente antigo encontrado em todos_clientes')
            setClienteAntigo(true)
            setTermosAceitos(true) // Para compatibilidade
            setTermosRejeitados(false)
          } else {
            console.log('⚠️ [useTermosAceitos] Cliente novo sem perfil criado - termos não aceitos')
            setClienteAntigo(false)
            setTermosAceitos(false)
            setTermosRejeitados(false)
          }
        } else {
          console.log('⚠️ [useTermosAceitos] Cliente não encontrado - assumindo cliente novo')
          setClienteAntigo(false)
          setTermosAceitos(false)
          setTermosRejeitados(false)
        }
      }
    } catch (error) {
      console.error('❌ [useTermosAceitos] Erro crítico:', error)
      setTermosAceitos(false)
      setTermosRejeitados(false)
      setClienteAntigo(false)
    } finally {
      setLoading(false)
    }
  }

  const marcarTermosAceitos = async () => {
    if (!user?.email) {
      console.error('❌ [useTermosAceitos] Usuário não encontrado')
      return
    }

    console.log('✅ [useTermosAceitos] Marcando termos como aceitos para:', user.email)
    
    try {
      const { error } = await supabase
        .from('cliente_profiles')
        .upsert({
          email_cliente: user.email,
          termos_aceitos: true,
          termos_rejeitados: false,
          data_aceite_termos: new Date().toISOString(),
          data_rejeicao_termos: null
        }, {
          onConflict: 'email_cliente'
        })

      if (error) {
        console.error('❌ [useTermosAceitos] Erro ao salvar aceitação:', error)
        throw error
      }

      console.log('💾 [useTermosAceitos] Termos aceitos salvos no banco')
      
      // Atualizar estados locais
      setTermosAceitos(true)
      setTermosRejeitados(false)
      
    } catch (error) {
      console.error('❌ [useTermosAceitos] Erro ao marcar termos aceitos:', error)
      throw error
    }
  }

  const marcarTermosRejeitados = async () => {
    if (!user?.email) {
      console.error('❌ [useTermosAceitos] Usuário não encontrado')
      return
    }

    console.log('❌ [useTermosAceitos] Marcando termos como rejeitados para:', user.email)
    
    try {
      const { error } = await supabase
        .from('cliente_profiles')
        .upsert({
          email_cliente: user.email,
          termos_aceitos: false,
          termos_rejeitados: true,
          data_rejeicao_termos: new Date().toISOString(),
          data_aceite_termos: null
        }, {
          onConflict: 'email_cliente'
        })

      if (error) {
        console.error('❌ [useTermosAceitos] Erro ao salvar rejeição:', error)
        throw error
      }

      console.log('💾 [useTermosAceitos] Termos rejeitados salvos no banco')
      
      // Atualizar estados locais
      setTermosRejeitados(true)
      setTermosAceitos(false)
      
    } catch (error) {
      console.error('❌ [useTermosAceitos] Erro ao marcar termos rejeitados:', error)
      throw error
    }
  }

  const limparEstadoRejeicao = async () => {
    console.log('🔄 [useTermosAceitos] Limpando estado de rejeição')
    setTermosRejeitados(false)
    
    // Limpar no banco também
    if (user?.email) {
      try {
        await supabase
          .from('cliente_profiles')
          .update({
            termos_rejeitados: false,
            data_rejeicao_termos: null
          })
          .eq('email_cliente', user.email)
        console.log('💾 [useTermosAceitos] Estado de rejeição limpo no banco')
      } catch (error) {
        console.error('❌ [useTermosAceitos] Erro ao limpar rejeição:', error)
      }
    }
  }

  useEffect(() => {
    checkTermosAceitos()
  }, [user?.email])

  return {
    termosAceitos,
    termosRejeitados,
    clienteAntigo,
    loading,
    marcarTermosAceitos,
    marcarTermosRejeitados,
    limparEstadoRejeicao,
    refetch: checkTermosAceitos
  }
}
