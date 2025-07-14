
import { useClienteUpdate } from '@/hooks/useClienteUpdate'
import { useClienteAdd } from '@/hooks/useClienteAdd'
import { clienteLogger } from '@/utils/logger'

export function useClienteOperations(userEmail: string, isAdmin: boolean, refetchData: () => Promise<void>) {
  const { updateCliente: baseUpdateCliente } = useClienteUpdate(userEmail, isAdmin, refetchData)
  const { addCliente: baseAddCliente } = useClienteAdd(userEmail, isAdmin, refetchData)

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
