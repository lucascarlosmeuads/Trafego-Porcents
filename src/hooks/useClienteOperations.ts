
import { useClienteUpdate } from '@/hooks/useClienteUpdate'
import { useClienteAdd } from '@/hooks/useClienteAdd'
import { clienteLogger } from '@/utils/logger'

export function useClienteOperations(userEmail: string, isAdmin: boolean, refetchData: () => Promise<void>) {
  // Garantir que os parâmetros são válidos antes de chamar hooks filhos
  const safeUserEmail = userEmail || 'fallback@example.com'
  const safeIsAdmin = Boolean(isAdmin)
  
  const { updateCliente: baseUpdateCliente } = useClienteUpdate(safeUserEmail, safeIsAdmin, refetchData)
  const { addCliente: baseAddCliente } = useClienteAdd(safeUserEmail, safeIsAdmin, refetchData)

  // Log das operações para debugging
  const wrappedUpdateCliente = async (...args: Parameters<typeof baseUpdateCliente>) => {
    clienteLogger.info('Iniciando atualização de cliente', { userEmail, isAdmin })
    try {
      const result = await baseUpdateCliente(...args)
      clienteLogger.info('Cliente atualizado com sucesso')
      return result
    } catch (error) {
      clienteLogger.error('Erro ao atualizar cliente', { error })
      throw error
    }
  }

  const wrappedAddCliente = async (...args: Parameters<typeof baseAddCliente>) => {
    clienteLogger.info('Iniciando adição de cliente', { userEmail, isAdmin })
    try {
      const result = await baseAddCliente(...args)
      clienteLogger.info('Cliente adicionado com sucesso')
      return result
    } catch (error) {
      clienteLogger.error('Erro ao adicionar cliente', { error })
      throw error
    }
  }

  return {
    updateCliente: wrappedUpdateCliente,
    addCliente: wrappedAddCliente
  }
}
