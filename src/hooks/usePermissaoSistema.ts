
import { useTermosAceitos } from './useTermosAceitos'

export function usePermissaoSistema() {
  const { termosAceitos, clienteAntigo, loading } = useTermosAceitos()

  // Se ainda está carregando, assumir que pode usar (evitar bloqueio desnecessário)
  if (loading) {
    return { podeUsarSistema: true, loading: true }
  }

  // Cliente antigo sempre pode usar o sistema
  if (clienteAntigo) {
    return { podeUsarSistema: true, loading: false }
  }

  // Cliente novo só pode usar se aceitou os termos
  return { 
    podeUsarSistema: termosAceitos === true, 
    loading: false 
  }
}
