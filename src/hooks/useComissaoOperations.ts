
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useComissaoOperations() {
  const [loading, setLoading] = useState(false)
  const [operationLock, setOperationLock] = useState(false)
  const { toast } = useToast()

  const atualizarComissao = async (
    clienteId: string | number,
    novoStatusComissao: string
  ) => {
    console.log('🚀 [useComissaoOperations] === INÍCIO DA OPERAÇÃO CRÍTICA ===')
    console.log('🔍 [useComissaoOperations] Parâmetros recebidos:', {
      clienteId,
      clienteIdType: typeof clienteId,
      novoStatusComissao,
      operationLock
    })

    // Verificar se há uma operação em andamento (LOCK GLOBAL)
    if (operationLock) {
      console.error('🚫 [useComissaoOperations] OPERAÇÃO BLOQUEADA: Já existe uma operação em andamento')
      toast({
        title: "Aguarde",
        description: "Já existe uma operação de comissão em andamento",
        variant: "destructive"
      })
      return false
    }

    // Ativar o lock global
    setOperationLock(true)
    setLoading(true)
    
    try {
      const clienteIdNumber = Number(clienteId)
      
      // VALIDAÇÃO 1: Verificar se o ID é válido
      if (isNaN(clienteIdNumber) || clienteIdNumber <= 0) {
        console.error('❌ [useComissaoOperations] ID INVÁLIDO:', { clienteId, clienteIdNumber })
        throw new Error(`ID do cliente inválido: ${clienteId}`)
      }

      // VALIDAÇÃO 2: Buscar o cliente DIRETAMENTE no banco para verificar se existe
      console.log('🔍 [useComissaoOperations] Buscando cliente no banco de dados...')
      const { data: clienteAtual, error: fetchError } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, email_cliente, comissao')
        .eq('id', clienteIdNumber)
        .single()

      if (fetchError) {
        console.error('❌ [useComissaoOperations] Erro ao buscar cliente:', fetchError)
        throw new Error(`Cliente não encontrado: ${fetchError.message}`)
      }

      if (!clienteAtual) {
        console.error('❌ [useComissaoOperations] Cliente não existe no banco:', clienteIdNumber)
        throw new Error(`Cliente com ID ${clienteIdNumber} não encontrado`)
      }

      console.log('✅ [useComissaoOperations] Cliente encontrado:', {
        id: clienteAtual.id,
        nome: clienteAtual.nome_cliente,
        email: clienteAtual.email_cliente,
        comissaoAtual: clienteAtual.comissao
      })

      // VALIDAÇÃO 3: Verificar se o status está realmente mudando
      if (clienteAtual.comissao === novoStatusComissao) {
        console.warn('⚠️ [useComissaoOperations] Status já é o mesmo, operação desnecessária')
        toast({
          title: "Aviso",
          description: `A comissão de ${clienteAtual.nome_cliente} já está como: ${novoStatusComissao}`,
        })
        return true
      }

      // ATUALIZAÇÃO CRÍTICA: Atualizar apenas a coluna comissao na tabela todos_clientes
      console.log('💾 [useComissaoOperations] Executando atualização no banco...')
      const { data: updatedData, error: updateError } = await supabase
        .from('todos_clientes')
        .update({ 
          comissao: novoStatusComissao
        })
        .eq('id', clienteIdNumber)
        .select('id, nome_cliente, comissao')

      if (updateError) {
        console.error('❌ [useComissaoOperations] Erro na atualização:', updateError)
        throw updateError
      }

      // VALIDAÇÃO 4: Verificar se a atualização retornou dados
      if (!updatedData || updatedData.length === 0) {
        console.error('❌ [useComissaoOperations] ERRO CRÍTICO: Nenhuma linha foi atualizada')
        throw new Error('Nenhuma linha foi afetada pela atualização')
      }

      if (updatedData.length > 1) {
        console.error('❌ [useComissaoOperations] ERRO CRÍTICO: Múltiplas linhas afetadas:', updatedData.length)
        throw new Error(`Erro crítico: ${updatedData.length} linhas afetadas (deveria ser 1)`)
      }

      const clienteAtualizado = updatedData[0]

      // VALIDAÇÃO 5: Confirmar que a atualização foi aplicada corretamente
      if (clienteAtualizado.comissao !== novoStatusComissao) {
        console.error('❌ [useComissaoOperations] VALIDAÇÃO FALHOU:', {
          esperado: novoStatusComissao,
          encontrado: clienteAtualizado.comissao
        })
        throw new Error('A atualização não foi aplicada corretamente')
      }

      console.log('✅ [useComissaoOperations] OPERAÇÃO CONCLUÍDA COM SUCESSO:', {
        clienteId: clienteAtualizado.id,
        clienteNome: clienteAtualizado.nome_cliente,
        novoStatus: clienteAtualizado.comissao
      })

      toast({
        title: "Comissão atualizada!",
        description: `${clienteAtualizado.nome_cliente}: ${novoStatusComissao}`,
      })

      return true

    } catch (error) {
      console.error('💥 [useComissaoOperations] ERRO CRÍTICO NA OPERAÇÃO:', error)
      toast({
        title: "Erro crítico ao atualizar comissão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
      setOperationLock(false)
      console.log('🏁 [useComissaoOperations] === FIM DA OPERAÇÃO CRÍTICA ===')
    }
  }

  return {
    atualizarComissao,
    loading,
    operationLock
  }
}
