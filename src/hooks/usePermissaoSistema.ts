
import { useTermosAceitos } from './useTermosAceitos'

export function usePermissaoSistema() {
  const { termosAceitos, termosRejeitados, clienteAntigo, loading, error } = useTermosAceitos()

  console.log('🔍 [usePermissaoSistema] === VERIFICAÇÃO DE PERMISSÃO ===')
  console.log('🔍 [usePermissaoSistema] Loading:', loading)
  console.log('🔍 [usePermissaoSistema] Cliente antigo:', clienteAntigo)
  console.log('🔍 [usePermissaoSistema] Termos aceitos:', termosAceitos)
  console.log('🔍 [usePermissaoSistema] Termos rejeitados:', termosRejeitados)
  console.log('🔍 [usePermissaoSistema] Error:', error)

  // Se ainda está carregando
  if (loading) {
    console.log('⏳ [usePermissaoSistema] Ainda carregando - bloqueando temporariamente')
    return { podeUsarSistema: false, termosRejeitados: false, loading: true }
  }

  // Se teve erro, liberar acesso para não bloquear usuário
  if (error) {
    console.log('⚠️ [usePermissaoSistema] Erro detectado - liberando acesso')
    return { podeUsarSistema: true, termosRejeitados: false, loading: false }
  }

  // Cliente antigo sempre pode usar o sistema
  if (clienteAntigo) {
    console.log('✅ [usePermissaoSistema] Cliente antigo - acesso liberado')
    return { podeUsarSistema: true, termosRejeitados: false, loading: false }
  }

  // Se rejeitou os termos, não pode usar o sistema
  if (termosRejeitados) {
    console.log('❌ [usePermissaoSistema] Termos rejeitados - bloqueando acesso')
    return { podeUsarSistema: false, termosRejeitados: true, loading: false }
  }

  // Cliente novo só pode usar se aceitou os termos
  const podeUsar = termosAceitos === true
  console.log('🎯 [usePermissaoSistema] Cliente novo - pode usar:', podeUsar)
  
  return { 
    podeUsarSistema: podeUsar, 
    termosRejeitados: false,
    loading: false 
  }
}
