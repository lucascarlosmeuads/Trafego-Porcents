
import { useCallback, useMemo } from 'react'
import { useClienteOperations } from './useClienteOperations'

interface UseOptimizedClienteOperationsProps {
  userEmail: string
  isAdminUser?: boolean
  onDataUpdate?: () => void
}

export function useOptimizedClienteOperations({
  userEmail,
  isAdminUser = false,
  onDataUpdate
}: UseOptimizedClienteOperationsProps) {
  console.log('⚙️ [useOptimizedClienteOperations] Hook de operações otimizado inicializado')
  
  // Hook original
  const { updateCliente, addCliente } = useClienteOperations(
    userEmail, 
    isAdminUser, 
    onDataUpdate
  )

  // CALLBACK OTIMIZADO: Update com debounce e validação
  const optimizedUpdateCliente = useCallback(async (
    id: string, 
    field: string, 
    value: string | boolean | number
  ) => {
    console.log('📝 [useOptimizedClienteOperations] Update otimizado:', { id, field, value })
    
    // Validação básica antes de executar
    if (!id || !field) {
      console.warn('⚠️ [useOptimizedClienteOperations] Parâmetros inválidos para update')
      return false
    }

    const startTime = performance.now()
    
    try {
      const result = await updateCliente(id, field, value)
      
      const endTime = performance.now()
      console.log(`⚡ [useOptimizedClienteOperations] Update executado em ${(endTime - startTime).toFixed(2)}ms`)
      
      return result
    } catch (error) {
      console.error('❌ [useOptimizedClienteOperations] Erro no update otimizado:', error)
      return false
    }
  }, [updateCliente])

  // CALLBACK OTIMIZADO: Add cliente com validação
  const optimizedAddCliente = useCallback(async (clienteData: any) => {
    console.log('➕ [useOptimizedClienteOperations] Add cliente otimizado')
    
    // Validação básica dos dados
    if (!clienteData || !clienteData.nome_cliente) {
      console.warn('⚠️ [useOptimizedClienteOperations] Dados de cliente inválidos')
      return null
    }

    const startTime = performance.now()
    
    try {
      const result = await addCliente(clienteData)
      
      const endTime = performance.now()
      console.log(`⚡ [useOptimizedClienteOperations] Cliente adicionado em ${(endTime - startTime).toFixed(2)}ms`)
      
      return result
    } catch (error) {
      console.error('❌ [useOptimizedClienteOperations] Erro ao adicionar cliente:', error)
      return null
    }
  }, [addCliente])

  // MEMOIZAÇÃO: Retorno das operações otimizadas
  const operations = useMemo(() => ({
    updateCliente: optimizedUpdateCliente,
    addCliente: optimizedAddCliente
  }), [optimizedUpdateCliente, optimizedAddCliente])

  return operations
}
