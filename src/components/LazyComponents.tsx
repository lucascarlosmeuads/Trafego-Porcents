
import { lazy } from 'react'

// Dashboard Components
export const LazyAdminDashboard = lazy(() => import('./AdminDashboard').then(m => ({ default: m.AdminDashboard })))
export const LazyGestorDashboard = lazy(() => import('./GestorDashboard').then(m => ({ default: m.GestorDashboard })))
export const LazyClienteDashboard = lazy(() => import('./ClienteDashboard').then(m => ({ default: m.ClienteDashboard })))

// ETAPA 3: VERSÕES OTIMIZADAS
export const LazyOptimizedAdminDashboard = lazy(() => import('./AdminDashboard/OptimizedAdminDashboard').then(m => ({ default: m.OptimizedAdminDashboard })))

// Chat Components  
export const LazyChatLayoutSplit = lazy(() => import('./Chat/ChatLayoutSplit').then(m => ({ default: m.ChatLayoutSplit })))
export const LazyAdminChatLayoutSplit = lazy(() => import('./Chat/AdminChatLayoutSplit').then(m => ({ default: m.AdminChatLayoutSplit })))

// Other Components
export const LazyStatusFunnelDashboard = lazy(() => import('./Dashboard/StatusFunnelDashboard').then(m => ({ default: m.StatusFunnelDashboard })))
export const LazyDocumentationViewer = lazy(() => import('./Documentation').then(m => ({ default: m.DocumentationViewer })))

// Admin Dashboard specific lazy components
export const LazyAdminDashboardMetrics = lazy(() => import('./AdminDashboard/AdminDashboardMetrics').then(m => ({ default: m.AdminDashboardMetrics })))
export const LazyClientesTable = lazy(() => import('./ClientesTable').then(m => ({ default: m.ClientesTable })))
export const LazyGestoresManagement = lazy(() => import('./GestoresManagement').then(m => ({ default: m.GestoresManagement })))

// ETAPA 3: VERSÕES OTIMIZADAS COM PERFORMANCE
export const LazyOptimizedAdminDashboardMetrics = lazy(() => import('./AdminDashboard/OptimizedAdminDashboardMetrics').then(m => ({ default: m.OptimizedAdminDashboardMetrics })))
