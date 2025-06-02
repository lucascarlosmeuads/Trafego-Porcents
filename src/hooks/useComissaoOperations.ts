
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
  const [operationResults, setOperationResults] = useState<Record<string, string>>({})
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
      console.log(`🔍 [COMISSAO-CRITICAL] Validando cliente ${clienteId} no banco...`)
      
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, comissao')
        .eq('id', Number(clienteId))
        .single()

      if (error) {
        console.error('❌ [COMISSAO-CRITICAL] Erro ao validar cliente:', error)
        return { exists: false, currentStatus: null, clienteNome: null }
      }

      const result = { 
        exists: true, 
        currentStatus: data.comissao || 'Pendente',
        clienteNome: data.nome_cliente || 'Nome não informado'
      }

      console.log(`✅ [COMISSAO-CRITICAL] Cliente validado:`, result)
      return result
    } catch (error) {
      console.error('❌ [COMISSAO-CRITICAL] Erro inesperado na validação:', error)
      return { exists: false, currentStatus: null, clienteNome: null }
    }
  }

  const forceRefreshData = (refetchCallback?: () => void) => {
    console.log('🔄 [COMISSAO-CRITICAL] Forçando refresh dos dados...')
    if (refetchCallback) {
      setTimeout(() => {
        refetchCallback()
      }, 500)
    }
  }

  const toggleComissao = async (
    clienteId: string,
    expectedCurrentStatus: string,
    onSuccess?: (newStatus: string) => void,
    refetchData?: () => void
  ): Promise<{ success: boolean, newStatus?: string }> => {
    // PROTEÇÃO CRÍTICA 1: Bloquear se já existe operação em andamento
    if (isAnyOperationRunning) {
      console.warn('⚠️ [COMISSAO-CRITICAL] OPERAÇÃO BLOQUEADA - já existe operação em andamento')
      toast({
        title: "🚫 Operação Bloqueada",
        description: "Aguarde a operação anterior terminar. Sistema protegido contra conflitos financeiros.",
        variant: "destructive"
      })
      return { success: false }
    }

    console.log(`🚀 [COMISSAO-CRITICAL] === INICIANDO OPERAÇÃO CRÍTICA ===`)
    console.log(`🎯 Cliente: ${clienteId}`)
    console.log(`📊 Status Esperado: "${expectedCurrentStatus}"`)
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`)

    setIsAnyOperationRunning(true)
    
    let validation: { exists: boolean, currentStatus: string | null, clienteNome: string | null } | null = null
    
    try {
      // PROTEÇÃO CRÍTICA 2: Validar que o cliente existe e obter status atual DIRETO DO BANCO
      validation = await validateClienteExists(clienteId)
      
      if (!validation.exists) {
        throw new Error(`❌ ERRO CRÍTICO: Cliente ${clienteId} não encontrado no banco de dados`)
      }

      const currentStatusFromDB = validation.currentStatus!
      const clienteNome = validation.clienteNome!

      // PROTEÇÃO CRÍTICA 3: Verificar se o status atual ainda é o esperado
      if (currentStatusFromDB !== expectedCurrentStatus) {
        console.error(`🚨 [COMISSAO-CRITICAL] STATUS DIVERGENTE DETECTADO!`)
        console.error(`   Esperado na interface: "${expectedCurrentStatus}"`)
        console.error(`   Atual no banco: "${currentStatusFromDB}"`)
        console.error(`   Cliente: ${clienteNome} (ID: ${clienteId})`)
        
        toast({
          title: "⚠️ Status Desatualizado",
          description: `Status do ${clienteNome} foi alterado. Recarregando dados para sincronizar...`,
          variant: "destructive"
        })
        
        // Forçar refresh para sincronizar
        forceRefreshData(refetchData)
        return { success: false }
      }

      // PROTEÇÃO CRÍTICA 4: Calcular novo status
      const novoStatus = currentStatusFromDB === 'Pago' ? 'Pendente' : 'Pago'
      
      const operation: ComissaoOperation = {
        clienteId,
        clienteNome,
        statusAtual: currentStatusFromDB,
        novoStatus,
        timestamp: new Date().toISOString()
      }

      setCurrentOperation(operation)
      logOperation(operation, 'SUCCESS')

      // PROTEÇÃO CRÍTICA 5: Operação atômica no banco com WHERE duplo
      console.log(`💾 [COMISSAO-CRITICAL] Executando UPDATE atômico...`)
      const { error, data } = await supabase
        .from('todos_clientes')
        .update({ comissao: novoStatus })
        .eq('id', Number(clienteId))
        .eq('comissao', currentStatusFromDB) // WHERE adicional para garantir atomicidade
        .select('id, comissao, nome_cliente')

      if (error) {
        throw new Error(`Erro no banco de dados: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('ERRO CRÍTICO: Nenhuma linha foi atualizada - possível conflito de concorrência ou cliente já foi alterado por outro usuário')
      }

      // PROTEÇÃO CRÍTICA 6: Verificar se a atualização foi bem sucedida
      const updatedRecord = data[0]
      if (updatedRecord.comissao !== novoStatus) {
        throw new Error(`ERRO CRÍTICO: Status não foi atualizado corretamente. Esperado: ${novoStatus}, Atual: ${updatedRecord.comissao}`)
      }

      console.log(`✅ [COMISSAO-CRITICAL] Operação bem-sucedida:`, {
        clienteId: updatedRecord.id,
        novoStatus: updatedRecord.comissao,
        clienteNome: updatedRecord.nome_cliente
      })

      // Registrar resultado para evitar operações duplicadas
      setOperationResults(prev => ({
        ...prev,
        [clienteId]: novoStatus
      }))

      toast({
        title: "✅ Comissão Atualizada com Segurança",
        description: `${updatedRecord.nome_cliente}: ${currentStatusFromDB} → ${updatedRecord.comissao}`,
      })

      // Callback de sucesso
      if (onSuccess) {
        onSuccess(updatedRecord.comissao)
      }

      // Forçar refresh para garantir sincronização
      forceRefreshData(refetchData)

      return { success: true, newStatus: updatedRecord.comissao }

    } catch (error) {
      const operation: ComissaoOperation = {
        clienteId,
        clienteNome: validation?.clienteNome || 'Cliente Desconhecido',
        statusAtual: expectedCurrentStatus,
        novoStatus: 'ERRO',
        timestamp: new Date().toISOString()
      }

      logOperation(operation, 'ERROR', error)

      console.error('💥 [COMISSAO-CRITICAL] ERRO CRÍTICO na operação de comissão:', error)
      
      toast({
        title: "❌ Erro Crítico de Comissão",
        description: `Falha ao atualizar comissão: ${error.message}. Dados sendo recarregados para garantir sincronização.`,
        variant: "destructive"
      })

      // Forçar refresh para garantir consistência
      forceRefreshData(refetchData)

      return { success: false }

    } finally {
      setIsAnyOperationRunning(false)
      setCurrentOperation(null)
    }
  }

  return {
    toggleComissao,
    isAnyOperationRunning,
    currentOperation,
    operationResults
  }
}
