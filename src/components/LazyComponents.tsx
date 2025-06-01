
import { lazy } from 'react'

// Lazy load components
export const LazyAdminDashboard = lazy(() => import('./AdminDashboard'))
export const LazyGestorDashboard = lazy(() => import('./GestorDashboard'))
export const LazyClienteDashboard = lazy(() => import('./ClienteDashboard'))
export const LazyAdminChatLayoutSplit = lazy(() => import('./Chat/AdminChatLayoutSplit'))

// Add UnauthorizedUser to lazy loading
export const LazyUnauthorizedUser = lazy(() => import('./UnauthorizedUser'))
