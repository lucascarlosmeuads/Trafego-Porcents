
import { useTermosAceitos } from './useTermosAceitos'

export function usePermissaoSistema() {
  const { termosAceitos, termosRejeitados, clienteAntigo, loading } = useTermosAceitos()

  console.log('🔍 [usePermissaoSistema] === DEBUG PERMISSAO ===')
  console.log('🔍 [usePermissaoSistema] Valores recebidos:', {
    termosAceitos,
    termosRejeitados,
    clienteAntigo,
    loading
  })

  // Se ainda está carregando, assumir que pode usar (evitar bloqueio desnecessário)
  if (loading) {
    console.log('⏳ [usePermissaoSistema] Ainda carregando - permitindo acesso temporário')
    return { podeUsarSistema: true, termosRejeitados: false, loading: true }
  }

  // Cliente antigo sempre pode usar o sistema
  if (clienteAntigo) {
    console.log('👴 [usePermissaoSistema] Cliente antigo - acesso liberado')
    return { podeUsarSistema: true, termosRejeitados: false, loading: false }
  }

  // Se rejeitou os termos, não pode usar o sistema
  if (termosRejeitados) {
    console.log('❌ [usePermissaoSistema] Termos rejeitados - bloqueando acesso')
    return { podeUsarSistema: false, termosRejeitados: true, loading: false }
  }

  // Cliente novo só pode usar se aceitou os termos
  const podeUsar = termosAceitos === true
  console.log(`${podeUsar ? '✅' : '🚫'} [usePermissaoSistema] Cliente novo - pode usar: ${podeUsar}`)
  
  return { 
    podeUsarSistema: podeUsar, 
    termosRejeitados: false,
    loading: false 
  }
}
