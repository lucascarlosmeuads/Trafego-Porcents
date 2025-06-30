
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

export interface HistoricoPagamento {
  id: string
  cliente_id: number
  valor_pago: number
  data_pagamento: string
  pago_por: string
  observacoes?: string
  created_at: string
}

export interface ComissaoOperacoes {
  atualizarValorComissao: (clienteId: string, novoValor: number) => Promise<boolean>
  registrarPagamento: (clienteId: string, valor: number, observacoes?: string) => Promise<boolean>
  buscarHistoricoPagamentos: (clienteId: string) => Promise<HistoricoPagamento[]>
  marcarComoUltimoPago: (clienteId: string) => Promise<boolean>
  removerMarcacaoUltimoPago: (clienteId: string) => Promise<boolean>
  calcularTotaisPorStatus: (clientes: any[]) => { totalPendente: number, totalPago: number }
}

export function useComissaoAvancada(): ComissaoOperacoes & { loading: boolean } {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const atualizarValorComissao = async (clienteId: string, novoValor: number): Promise<boolean> => {
    if (novoValor < 10 || novoValor > 1000) {
      toast({
        title: "Valor inválido",
        description: "O valor da comissão deve estar entre R$ 10 e R$ 1.000",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ valor_comissao: novoValor })
        .eq('id', clienteId)

      if (error) throw error

      toast({
        title: "✅ Valor atualizado",
        description: `Comissão atualizada para R$ ${novoValor.toFixed(2)}`,
      })
      return true
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const registrarPagamento = async (clienteId: string, valor: number, observacoes?: string): Promise<boolean> => {
    if (!user?.email) {
      toast({
        title: "❌ Erro de autenticação",
        description: "Usuário não autenticado",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    try {
      // Registrar pagamento no histórico
      const { error: historyError } = await supabase
        .from('historico_pagamentos_comissao')
        .insert({
          cliente_id: parseInt(clienteId),
          valor_pago: valor,
          pago_por: user.email,
          observacoes: observacoes || null
        })

      if (historyError) throw historyError

      toast({
        title: "✅ Pagamento registrado",
        description: `Comissão de R$ ${valor.toFixed(2)} registrada com sucesso`,
      })
      return true
    } catch (error: any) {
      toast({
        title: "❌ Erro ao registrar pagamento",
        description: error.message,
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const buscarHistoricoPagamentos = async (clienteId: string): Promise<HistoricoPagamento[]> => {
    try {
      const { data, error } = await supabase
        .from('historico_pagamentos_comissao')
        .select('*')
        .eq('cliente_id', parseInt(clienteId))
        .order('data_pagamento', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error)
      return []
    }
  }

  const marcarComoUltimoPago = async (clienteId: string): Promise<boolean> => {
    setLoading(true)
    try {
      // Primeiro, remover marcação de outros clientes
      await supabase
        .from('todos_clientes')
        .update({ eh_ultimo_pago: false })
        .neq('id', clienteId)

      // Marcar este cliente como último pago
      const { error } = await supabase
        .from('todos_clientes')
        .update({ eh_ultimo_pago: true })
        .eq('id', clienteId)

      if (error) throw error

      toast({
        title: "⭐ Cliente marcado",
        description: "Cliente marcado como último pago",
      })
      return true
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const removerMarcacaoUltimoPago = async (clienteId: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ eh_ultimo_pago: false })
        .eq('id', clienteId)

      if (error) throw error

      toast({
        title: "✅ Marcação removida",
        description: "Marcação de último pago removida",
      })
      return true
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const calcularTotaisPorStatus = (clientes: any[]) => {
    let totalPendente = 0
    let totalPago = 0

    clientes.forEach(cliente => {
      const valor = cliente.valor_comissao || 60
      if (cliente.comissao === 'Pago') {
        totalPago += valor
      } else {
        totalPendente += valor
      }
    })

    return { totalPendente, totalPago }
  }

  return {
    atualizarValorComissao,
    registrarPagamento,
    buscarHistoricoPagamentos,
    marcarComoUltimoPago,
    removerMarcacaoUltimoPago,
    calcularTotaisPorStatus,
    loading
  }
}
