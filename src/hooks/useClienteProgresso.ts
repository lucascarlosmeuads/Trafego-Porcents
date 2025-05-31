
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

  // Buscar progresso existente
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

  // Alternar status de um passo
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
    refetch: fetchProgresso
  }
}
