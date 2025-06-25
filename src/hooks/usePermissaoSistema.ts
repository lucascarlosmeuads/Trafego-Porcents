
import { useTermosAceitos } from './useTermosAceitos'

export function usePermissaoSistema() {
  const { termosAceitos, termosRejeitados, clienteAntigo, loading } = useTermosAceitos()

  // Se ainda está carregando, assumir que pode usar (evitar bloqueio desnecessário)
  if (loading) {
    return { podeUsarSistema: true, termosRejeitados: false, loading: true }
  }

  // Cliente antigo sempre pode usar o sistema
  if (clienteAntigo) {
    return { podeUsarSistema: true, termosRejeitados: false, loading: false }
  }

  // Se rejeitou os termos, não pode usar o sistema
  if (termosRejeitados) {
    return { podeUsarSistema: false, termosRejeitados: true, loading: false }
  }

  // Cliente novo só pode usar se aceitou os termos
  return { 
    podeUsarSistema: termosAceitos === true, 
    termosRejeitados: false,
    loading: false 
  }
}
