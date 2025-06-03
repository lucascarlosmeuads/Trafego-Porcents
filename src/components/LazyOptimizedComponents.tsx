
import { lazy } from 'react'

// ETAPA 3: Componentes otimizados com lazy loading
export const LazyOptimizedAdminDashboard = lazy(() => 
  import('./AdminDashboard/OptimizedAdminDashboard').then(m => ({ 
    default: m.OptimizedAdminDashboard 
  }))
)

export const LazyOptimizedAdminDashboardMetrics = lazy(() => 
  import('./AdminDashboard/OptimizedAdminDashboardMetrics').then(m => ({ 
    default: m.OptimizedAdminDashboardMetrics 
  }))
)

// Re-export dos componentes originais para compatibilidade
export * from './LazyComponents'
