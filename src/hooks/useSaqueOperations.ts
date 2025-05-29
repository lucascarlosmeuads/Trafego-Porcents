
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useSaqueOperations() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const criarSolicitacaoSaque = async (
    clienteId: string | number,
    emailGestor: string,
    nomeGestor: string,
    valorComissao: number
  ) => {
    console.log('🚀 [useSaqueOperations] Iniciando criação de saque:', {
      clienteId,
      emailGestor,
      nomeGestor,
      valorComissao
    })

    if (!emailGestor || !nomeGestor) {
      console.error('❌ [useSaqueOperations] Dados incompletos do gestor')
      toast({
        title: "Erro",
        description: "Dados do gestor incompletos. Faça login novamente.",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    
    try {
      // 1. Criar solicitação na tabela solicitacoes_saque
      const { data: solicitacao, error: errorSolicitacao } = await supabase
        .from('solicitacoes_saque')
        .insert({
          cliente_id: Number(clienteId), // Garantir que seja número
          email_gestor: emailGestor,
          nome_gestor: nomeGestor,
          valor_comissao: valorComissao,
          status_saque: 'pendente'
        })
        .select()

      if (errorSolicitacao) {
        console.error('❌ [useSaqueOperations] Erro ao criar solicitação:', errorSolicitacao)
        throw errorSolicitacao
      }

      console.log('✅ [useSaqueOperations] Solicitação criada:', solicitacao)

      // 2. Atualizar o cliente para marcar saque_solicitado = true
      const { error: errorUpdate } = await supabase
        .from('todos_clientes')
        .update({ 
          saque_solicitado: true 
        })
        .eq('id', Number(clienteId)) // Garantir que seja número

      if (errorUpdate) {
        console.error('❌ [useSaqueOperations] Erro ao atualizar cliente:', errorUpdate)
        throw errorUpdate
      }

      console.log('✅ [useSaqueOperations] Cliente atualizado com saque_solicitado = true')

      toast({
        title: "Saque solicitado!",
        description: `Solicitação de R$ ${valorComissao.toFixed(2)} enviada com sucesso.`,
      })

      return true

    } catch (error) {
      console.error('💥 [useSaqueOperations] Erro geral:', error)
      toast({
        title: "Erro ao solicitar saque",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    criarSolicitacaoSaque,
    loading
  }
}
