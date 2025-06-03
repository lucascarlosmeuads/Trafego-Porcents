
import { lazy } from 'react'

// ETAPA 4: COMPONENTES ULTRA-OTIMIZADOS COM REACT QUERY
export const LazyUltraOptimizedAdminDashboard = lazy(() => 
  import('./AdminDashboard/UltraOptimizedAdminDashboard').then(m => ({ 
    default: m.UltraOptimizedAdminDashboard 
  }))
)

// Re-export dos componentes das etapas anteriores para compatibilidade
export * from './LazyOptimizedComponents'
export * from './LazyComponents'
