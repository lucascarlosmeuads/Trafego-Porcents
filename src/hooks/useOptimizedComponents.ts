
import { useMemo } from 'react'

/**
 * Hook para controlar se deve usar componentes otimizados
 * ETAPA 1: Otimizações Básicas (React.memo + useMemo)
 */
export function useOptimizedComponents() {
  // Por enquanto, sempre usar os componentes otimizados
  // Mais tarde pode ser controlado por feature flag ou configuração
  const shouldUseOptimized = useMemo(() => true, [])
  
  console.log('⚡ [useOptimizedComponents] Usando componentes otimizados:', shouldUseOptimized)
  
  return {
    shouldUseOptimized,
    // Método para alternar (para futuras implementações)
    toggleOptimized: () => {
      console.log('🔄 [useOptimizedComponents] Toggle de otimização não implementado ainda')
    }
  }
}
