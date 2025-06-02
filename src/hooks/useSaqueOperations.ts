
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useSaqueOperations() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const atualizarComissao = async (
    clienteId: string | number,
    novoStatusComissao: string
  ) => {
    console.log('🚀 [useSaqueOperations] === OPERAÇÃO SEGURA DE COMISSÃO ===')
    console.log('🚀 [useSaqueOperations] Cliente ID:', clienteId)
    console.log('🚀 [useSaqueOperations] Novo Status:', novoStatusComissao)

    setLoading(true)
    
    try {
      // PROTEÇÃO: Primeiro verificar se o cliente existe
      const { data: clienteAtual, error: fetchError } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, comissao')
        .eq('id', Number(clienteId))
        .single()

      if (fetchError || !clienteAtual) {
        throw new Error(`Cliente ${clienteId} não encontrado: ${fetchError?.message}`)
      }

      console.log('✅ [useSaqueOperations] Cliente encontrado:', {
        id: clienteAtual.id,
        nome: clienteAtual.nome_cliente,
        statusAtual: clienteAtual.comissao
      })

      // PROTEÇÃO: Operação atômica com validação
      const { error, data } = await supabase
        .from('todos_clientes')
        .update({ comissao: novoStatusComissao })
        .eq('id', Number(clienteId))
        .select('id, comissao, nome_cliente')

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhuma linha foi atualizada')
      }

      const updatedRecord = data[0]
      console.log('✅ [useSaqueOperations] Atualização confirmada:', {
        id: updatedRecord.id,
        novoStatus: updatedRecord.comissao,
        nome: updatedRecord.nome_cliente
      })

      toast({
        title: "✅ Comissão Atualizada",
        description: `${updatedRecord.nome_cliente}: Status alterado para ${novoStatusComissao}`,
      })

      return true

    } catch (error) {
      console.error('💥 [useSaqueOperations] Erro crítico:', error)
      toast({
        title: "❌ Erro ao Atualizar Comissão",
        description: `Falha: ${error.message}`,
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    atualizarComissao,
    loading
  }
}
