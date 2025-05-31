import { lazy } from 'react'

// Dashboard Components
export const LazyAdminDashboard = lazy(() => import('./AdminDashboard'))
export const LazyGestorDashboard = lazy(() => import('./GestorDashboard'))
export const LazyClienteDashboard = lazy(() => import('./ClienteDashboard'))

// Chat Components  
export const LazyChatLayoutSplit = lazy(() => import('./Chat/ChatLayoutSplit'))
export const LazyAdminChatLayoutSplit = lazy(() => import('./Chat/AdminChatLayoutSplit'))

// Other Components
export const LazyStatusFunnelDashboard = lazy(() => import('./Dashboard/StatusFunnelDashboard'))
export const LazyDocumentationViewer = lazy(() => import('./Documentation'))
