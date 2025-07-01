
import { lazy } from 'react'

// Lazy-load components to improve initial load time
export const LazyStatusFunnelDashboard = lazy(() => 
  import('./Dashboard/StatusFunnelDashboard').then(module => ({
    default: module.StatusFunnelDashboard || module.default
  })).catch(() => ({
    default: () => <div>Componente não encontrado</div>
  }))
)

export const LazyDocumentationViewer = lazy(() => 
  import('./Documentation/DocumentationViewer').then(module => ({
    default: module.DocumentationViewer || module.default
  })).catch(() => ({
    default: () => <div>Componente não encontrado</div>
  }))
)

// Admin Dashboard Enhanced - Lazy loading para melhor performance
export const LazyEnhancedAdminDashboard = lazy(() => 
  import('./AdminDashboard/EnhancedAdminDashboard').then(module => ({
    default: module.EnhancedAdminDashboard
  }))
)

// Lazy loading para os dashboards principais
export const LazyAdminDashboard = lazy(() => import('./AdminDashboard'))
export const LazyGestorDashboard = lazy(() => import('./GestorDashboard'))
export const LazyClienteDashboard = lazy(() => import('./ClienteDashboard'))
