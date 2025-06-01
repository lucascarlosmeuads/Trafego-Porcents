import { lazy } from 'react'

// Lazy load components
export const LazyAdminDashboard = lazy(() => import('./AdminDashboard'))
export const LazyGestorDashboard = lazy(() => import('./GestorDashboard'))
export const LazyClienteDashboard = lazy(() => import('./ClienteDashboard'))
export const LazyStatusFunnelDashboard = lazy(() => import('./AdminDashboard/StatusFunnelDashboard'))
export const LazyDocumentationViewer = lazy(() => import('./AdminDashboard/DocumentationViewer'))
export const LazyAdminChatLayoutSplit = lazy(() => import('./Chat/AdminChatLayoutSplit'))

// Add UnauthorizedUser to lazy loading
export const LazyUnauthorizedUser = lazy(() => import('./UnauthorizedUser'))
