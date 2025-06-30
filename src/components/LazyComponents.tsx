import { lazy } from 'react'

// Lazy-load components to improve initial load time
export const LazyStatusFunnelDashboard = lazy(() => import('./StatusFunnelDashboard'))
export const LazyDocumentationViewer = lazy(() => import('./DocumentationViewer'))
export const LazyRelatorioSacGestores = lazy(() => import('./SAC/RelatorioSacGestores'))

// Admin Dashboard Enhanced - Lazy loading para melhor performance
export const LazyEnhancedAdminDashboard = lazy(() => 
  import('./AdminDashboard/EnhancedAdminDashboard').then(module => ({
    default: module.EnhancedAdminDashboard
  }))
)
