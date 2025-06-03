
import { lazy } from 'react'

// Dashboard Components
export const LazyAdminDashboard = lazy(() => import('./AdminDashboard').then(m => ({ default: m.AdminDashboard })))
export const LazyGestorDashboard = lazy(() => import('./GestorDashboard').then(m => ({ default: m.GestorDashboard })))
export const LazyClienteDashboard = lazy(() => import('./ClienteDashboard').then(m => ({ default: m.ClienteDashboard })))

// Optimized Dashboard Components (ETAPA 1)
export const LazyOptimizedAdminDashboard = lazy(() => import('./AdminDashboard/OptimizedAdminDashboard').then(m => ({ default: m.OptimizedAdminDashboard })))
export const LazyOptimizedGestorDashboard = lazy(() => import('./GestorDashboard/OptimizedGestorDashboard').then(m => ({ default: m.OptimizedGestorDashboard })))

// Chat Components  
export const LazyChatLayoutSplit = lazy(() => import('./Chat/ChatLayoutSplit').then(m => ({ default: m.ChatLayoutSplit })))
export const LazyAdminChatLayoutSplit = lazy(() => import('./Chat/AdminChatLayoutSplit').then(m => ({ default: m.AdminChatLayoutSplit })))

// Other Components
export const LazyStatusFunnelDashboard = lazy(() => import('./Dashboard/StatusFunnelDashboard').then(m => ({ default: m.StatusFunnelDashboard })))
export const LazyDocumentationViewer = lazy(() => import('./Documentation').then(m => ({ default: m.DocumentationViewer })))
