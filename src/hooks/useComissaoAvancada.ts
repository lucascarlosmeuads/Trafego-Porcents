
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
    console.log('🌟 [useComissaoAvancada] === MARCAR COMO ÚLTIMO PAGO ===')
    console.log('🌟 [useComissaoAvancada] Cliente ID:', clienteId)
    console.log('🌟 [useComissaoAvancada] Usuário atual:', user?.email)
    
    setLoading(true)
    try {
      // Primeiro, verificar se o cliente existe
      console.log('🔍 [useComissaoAvancada] Verificando se cliente existe...')
      const { data: clienteExiste, error: checkError } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, eh_ultimo_pago')
        .eq('id', clienteId)
        .single()

      if (checkError) {
        console.error('❌ [useComissaoAvancada] Erro ao verificar cliente:', checkError)
        throw checkError
      }

      console.log('✅ [useComissaoAvancada] Cliente encontrado:', clienteExiste)

      // Remover marcação de outros clientes primeiro
      console.log('🔄 [useComissaoAvancada] Removendo marcação de outros clientes...')
      const { error: removeError } = await supabase
        .from('todos_clientes')
        .update({ eh_ultimo_pago: false })
        .neq('id', clienteId)

      if (removeError) {
        console.error('❌ [useComissaoAvancada] Erro ao remover outras marcações:', removeError)
        throw removeError
      }

      console.log('✅ [useComissaoAvancada] Outras marcações removidas')

      // Marcar este cliente como último pago
      console.log('⭐ [useComissaoAvancada] Marcando cliente como último pago...')
      const { data: updateData, error: updateError } = await supabase
        .from('todos_clientes')
        .update({ eh_ultimo_pago: true })
        .eq('id', clienteId)
        .select('id, nome_cliente, eh_ultimo_pago')

      if (updateError) {
        console.error('❌ [useComissaoAvancada] Erro ao marcar como último pago:', updateError)
        throw updateError
      }

      console.log('✅ [useComissaoAvancada] Cliente marcado com sucesso:', updateData)

      // Verificar se a atualização realmente aconteceu
      const { data: verificacao, error: verifyError } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, eh_ultimo_pago')
        .eq('id', clienteId)
        .single()

      if (verifyError) {
        console.error('❌ [useComissaoAvancada] Erro na verificação:', verifyError)
      } else {
        console.log('🔍 [useComissaoAvancada] Verificação final:', verificacao)
        console.log('🔍 [useComissaoAvancada] eh_ultimo_pago atual:', verificacao.eh_ultimo_pago)
      }

      toast({
        title: "⭐ Cliente marcado",
        description: `${clienteExiste.nome_cliente} marcado como último pago`,
      })
      return true
    } catch (error: any) {
      console.error('💥 [useComissaoAvancada] Erro geral:', error)
      toast({
        title: "❌ Erro",
        description: `Erro ao marcar cliente: ${error.message}`,
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const removerMarcacaoUltimoPago = async (clienteId: string): Promise<boolean> => {
    console.log('🌟 [useComissaoAvancada] === REMOVER MARCAÇÃO ÚLTIMO PAGO ===')
    console.log('🌟 [useComissaoAvancada] Cliente ID:', clienteId)
    
    setLoading(true)
    try {
      console.log('🔄 [useComissaoAvancada] Removendo marcação de último pago...')
      const { data: updateData, error } = await supabase
        .from('todos_clientes')
        .update({ eh_ultimo_pago: false })
        .eq('id', clienteId)
        .select('id, nome_cliente, eh_ultimo_pago')

      if (error) {
        console.error('❌ [useComissaoAvancada] Erro ao remover marcação:', error)
        throw error
      }

      console.log('✅ [useComissaoAvancada] Marcação removida:', updateData)

      toast({
        title: "✅ Marcação removida",
        description: "Marcação de último pago removida",
      })
      return true
    } catch (error: any) {
      console.error('💥 [useComissaoAvancada] Erro geral:', error)
      toast({
        title: "❌ Erro",
        description: `Erro ao remover marcação: ${error.message}`,
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
