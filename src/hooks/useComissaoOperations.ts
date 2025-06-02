
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface ComissaoOperation {
  clienteId: string
  clienteNome: string
  statusAtual: string
  novoStatus: string
  timestamp: string
}

export function useComissaoOperations() {
  const [isAnyOperationRunning, setIsAnyOperationRunning] = useState(false)
  const [currentOperation, setCurrentOperation] = useState<ComissaoOperation | null>(null)
  const { toast } = useToast()

  const logOperation = (operation: ComissaoOperation, result: 'SUCCESS' | 'ERROR', error?: any) => {
    console.log(`🔐 [COMISSAO-CRITICAL] === OPERAÇÃO ${result} ===`)
    console.log(`📋 Cliente ID: ${operation.clienteId}`)
    console.log(`👤 Cliente Nome: ${operation.clienteNome}`)
    console.log(`📊 Status Atual: ${operation.statusAtual}`)
    console.log(`🎯 Novo Status: ${operation.novoStatus}`)
    console.log(`⏰ Timestamp: ${operation.timestamp}`)
    if (error) {
      console.error(`❌ Erro:`, error)
    }
    console.log(`🔐 [COMISSAO-CRITICAL] === FIM OPERAÇÃO ===`)
  }

  const validateClienteExists = async (clienteId: string): Promise<{ exists: boolean, currentStatus: string | null, clienteNome: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, comissao')
        .eq('id', Number(clienteId))
        .single()

      if (error) {
        console.error('❌ [COMISSAO-CRITICAL] Erro ao validar cliente:', error)
        return { exists: false, currentStatus: null, clienteNome: null }
      }

      return { 
        exists: true, 
        currentStatus: data.comissao || 'Pendente',
        clienteNome: data.nome_cliente || 'Nome não informado'
      }
    } catch (error) {
      console.error('❌ [COMISSAO-CRITICAL] Erro inesperado na validação:', error)
      return { exists: false, currentStatus: null, clienteNome: null }
    }
  }

  const toggleComissao = async (
    clienteId: string,
    expectedCurrentStatus: string,
    onSuccess?: (newStatus: string) => void
  ): Promise<{ success: boolean, newStatus?: string }> => {
    // PROTEÇÃO 1: Bloquear se já existe operação em andamento
    if (isAnyOperationRunning) {
      console.warn('⚠️ [COMISSAO-CRITICAL] Operação bloqueada - já existe operação em andamento')
      toast({
        title: "Aguarde",
        description: "Aguarde a operação anterior terminar",
        variant: "destructive"
      })
      return { success: false }
    }

    setIsAnyOperationRunning(true)
    
    try {
      // PROTEÇÃO 2: Validar que o cliente existe e obter status atual
      const validation = await validateClienteExists(clienteId)
      
      if (!validation.exists) {
        throw new Error(`Cliente ${clienteId} não encontrado no banco de dados`)
      }

      const currentStatusFromDB = validation.currentStatus!
      const clienteNome = validation.clienteNome!

      // PROTEÇÃO 3: Verificar se o status atual ainda é o esperado
      if (currentStatusFromDB !== expectedCurrentStatus) {
        console.warn(`⚠️ [COMISSAO-CRITICAL] Status divergente detectado!`)
        console.warn(`   Esperado: "${expectedCurrentStatus}"`)
        console.warn(`   Atual no banco: "${currentStatusFromDB}"`)
        
        toast({
          title: "Status Desatualizado",
          description: "O status foi alterado por outro usuário. Recarregando dados...",
          variant: "destructive"
        })
        
        return { success: false }
      }

      // Calcular novo status
      const novoStatus = currentStatusFromDB === 'Pago' ? 'Pendente' : 'Pago'
      
      const operation: ComissaoOperation = {
        clienteId,
        clienteNome,
        statusAtual: currentStatusFromDB,
        novoStatus,
        timestamp: new Date().toISOString()
      }

      setCurrentOperation(operation)

      console.log(`🚀 [COMISSAO-CRITICAL] Iniciando operação segura:`)
      logOperation(operation, 'SUCCESS')

      // PROTEÇÃO 4: Operação atômica no banco
      const { error, data } = await supabase
        .from('todos_clientes')
        .update({ comissao: novoStatus })
        .eq('id', Number(clienteId))
        .eq('comissao', currentStatusFromDB) // WHERE adicional para garantir atomicidade
        .select('id, comissao')

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhuma linha foi atualizada - possível conflito de concorrência')
      }

      // PROTEÇÃO 5: Verificar se a atualização foi bem sucedida
      const updatedRecord = data[0]
      if (updatedRecord.comissao !== novoStatus) {
        throw new Error(`Status não foi atualizado corretamente. Esperado: ${novoStatus}, Atual: ${updatedRecord.comissao}`)
      }

      logOperation(operation, 'SUCCESS')

      toast({
        title: "✅ Comissão Atualizada",
        description: `${clienteNome}: ${currentStatusFromDB} → ${novoStatus}`,
      })

      if (onSuccess) {
        onSuccess(novoStatus)
      }

      return { success: true, newStatus: novoStatus }

    } catch (error) {
      const operation: ComissaoOperation = {
        clienteId,
        clienteNome: validation?.clienteNome || 'Desconhecido',
        statusAtual: expectedCurrentStatus,
        novoStatus: 'ERRO',
        timestamp: new Date().toISOString()
      }

      logOperation(operation, 'ERROR', error)

      console.error('💥 [COMISSAO-CRITICAL] Erro crítico na operação de comissão:', error)
      
      toast({
        title: "❌ Erro Crítico",
        description: `Falha ao atualizar comissão do cliente. Erro: ${error.message}`,
        variant: "destructive"
      })

      return { success: false }

    } finally {
      setIsAnyOperationRunning(false)
      setCurrentOperation(null)
    }
  }

  return {
    toggleComissao,
    isAnyOperationRunning,
    currentOperation
  }
}
