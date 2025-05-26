
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export function useSaqueOperations() {
  const [loading, setLoading] = useState(false)

  const criarSolicitacaoSaque = async (
    clienteId: string,
    emailGestor: string,
    nomeGestor: string,
    valorComissao: number
  ) => {
    setLoading(true)
    
    try {
      console.log('🚀 [useSaqueOperations] Criando solicitação de saque:', {
        clienteId,
        emailGestor,
        nomeGestor,
        valorComissao
      })

      // NOVA LÓGICA: Mudar o status do cliente para "Saque Pendente"
      const { error: updateStatusError } = await supabase
        .from('todos_clientes')
        .update({ 
          status_campanha: 'Saque Pendente',
          saque_solicitado: true 
        })
        .eq('id', parseInt(clienteId))

      if (updateStatusError) {
        console.error('❌ Erro ao alterar status para Saque Pendente:', updateStatusError)
        throw updateStatusError
      }

      // Depois, criar a solicitação de saque
      const { error: insertError } = await supabase
        .from('solicitacoes_saque')
        .insert({
          cliente_id: parseInt(clienteId),
          email_gestor: emailGestor,
          nome_gestor: nomeGestor,
          valor_comissao: valorComissao,
          status_saque: 'pendente'
        })

      if (insertError) {
        console.error('❌ Erro ao criar solicitação de saque:', insertError)
        throw insertError
      }

      console.log('✅ Solicitação de saque criada e cliente movido para Saque Pendente')
      
      toast({
        title: "Sucesso",
        description: "Solicitação de saque enviada! O cliente foi movido para 'Saque Pendente' e será processado pelo admin.",
      })

      return true
    } catch (error) {
      console.error('💥 Erro ao criar solicitação de saque:', error)
      toast({
        title: "Erro",
        description: "Falha ao enviar solicitação de saque",
        variant: "destructive",
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
