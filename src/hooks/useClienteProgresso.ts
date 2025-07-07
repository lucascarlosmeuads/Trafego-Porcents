
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface ClienteProgressoItem {
  id: string
  email_cliente: string
  passo_id: number
  completado: boolean
  data_completado: string | null
  created_at: string
  updated_at: string
}

export function useClienteProgresso(emailCliente: string) {
  const [progresso, setProgresso] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Função de carregamento de progresso
  const fetchProgresso = async () => {
    if (!emailCliente) return

    try {
      setLoading(true)
      console.log('🔍 [useClienteProgresso] Buscando progresso para:', emailCliente)

      const { data, error } = await supabase
        .from('cliente_progresso')
        .select('*')
        .eq('email_cliente', emailCliente)
        .eq('completado', true)

      if (error) {
        console.error('❌ [useClienteProgresso] Erro ao buscar progresso:', error)
        return
      }

      const completedSteps = new Set(data?.map(item => item.passo_id) || [])
      setProgresso(completedSteps)
      console.log('✅ [useClienteProgresso] Progresso carregado:', completedSteps)

    } catch (error) {
      console.error('💥 [useClienteProgresso] Erro crítico ao buscar progresso:', error)
    } finally {
      setLoading(false)
    }
  }

  // Função para marcar um passo como completo (sem toggle)
  const marcarPasso = async (passoId: number) => {
    if (!emailCliente || saving) return

    try {
      setSaving(true)
      console.log(`✅ [useClienteProgresso] Marcando passo ${passoId} como completo`)

      // Sempre marcar como completado
      const { error } = await supabase
        .from('cliente_progresso')
        .upsert({
          email_cliente: emailCliente,
          passo_id: passoId,
          completado: true,
          data_completado: new Date().toISOString()
        }, {
          onConflict: 'email_cliente,passo_id'
        })

      if (error) {
        console.error('❌ [useClienteProgresso] Erro ao marcar passo:', error)
        return false
      }

      // Atualizar estado local
      const newProgresso = new Set(progresso)
      newProgresso.add(passoId)
      setProgresso(newProgresso)

      console.log('✅ [useClienteProgresso] Passo marcado com sucesso')
      return true

    } catch (error) {
      console.error('💥 [useClienteProgresso] Erro crítico ao marcar passo:', error)
      return false
    } finally {
      setSaving(false)
    }
  }

  // Função de alternância de status de um passo (manter para compatibilidade)
  const togglePasso = async (passoId: number) => {
    if (!emailCliente || saving) return

    try {
      setSaving(true)
      const isCompleted = progresso.has(passoId)
      const newCompleted = !isCompleted

      console.log(`🔄 [useClienteProgresso] ${newCompleted ? 'Marcando' : 'Desmarcando'} passo ${passoId}`)

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('cliente_progresso')
        .upsert({
          email_cliente: emailCliente,
          passo_id: passoId,
          completado: newCompleted,
          data_completado: newCompleted ? new Date().toISOString() : null
        }, {
          onConflict: 'email_cliente,passo_id'
        })

      if (error) {
        console.error('❌ [useClienteProgresso] Erro ao salvar progresso:', error)
        return false
      }

      // Atualizar estado local
      const newProgresso = new Set(progresso)
      if (newCompleted) {
        newProgresso.add(passoId)
      } else {
        newProgresso.delete(passoId)
      }
      setProgresso(newProgresso)

      console.log('✅ [useClienteProgresso] Progresso salvo com sucesso')
      return true

    } catch (error) {
      console.error('💥 [useClienteProgresso] Erro crítico ao salvar progresso:', error)
      return false
    } finally {
      setSaving(false)
    }
  }

  // Buscar progresso ao montar o componente
  useEffect(() => {
    fetchProgresso()
  }, [emailCliente])

  return {
    progresso,
    loading,
    saving,
    togglePasso,
    marcarPasso, // Nova função para marcar apenas
    refetch: fetchProgresso
  }
}
