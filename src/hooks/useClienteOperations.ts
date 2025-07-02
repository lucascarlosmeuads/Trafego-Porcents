
import { useClienteUpdate } from '@/hooks/useClienteUpdate'
import { useClienteAdd } from '@/hooks/useClienteAdd'

export function useClienteOperations(userEmail: string, isAdmin: boolean, refetchData: () => Promise<void>) {
  const { updateCliente } = useClienteUpdate(userEmail, isAdmin, refetchData)
  const { addCliente } = useClienteAdd(userEmail, isAdmin, refetchData)

  return {
    updateCliente,
    addCliente
  }
}
