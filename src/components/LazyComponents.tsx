
import { lazy, Suspense } from 'react'
import { LoadingFallback } from './LoadingFallback'
import { SacDashboard } from './SAC/SacDashboard'
import { AdminChatLayoutSplit } from './Chat/AdminChatLayoutSplit'

// Lazy components principais
const AdminDashboard = lazy(() => import('./AdminDashboard').then(module => ({ default: module.AdminDashboard })))
const GestorDashboard = lazy(() => import('./GestorDashboard').then(module => ({ default: module.GestorDashboard })))
const ClienteDashboard = lazy(() => import('./ClienteDashboard').then(module => ({ default: module.ClienteDashboard })))
const ClientesTable = lazy(() => import('./ClientesTable').then(module => ({ default: module.ClientesTable })))
const GestoresManagement = lazy(() => import('./GestoresManagement').then(module => ({ default: module.GestoresManagement })))

// Lazy component para o relatório SAC
const SacGestorReport = lazy(() => import('@/components/SAC/SacGestorReport').then(module => ({ default: module.SacGestorReport })))

// Exports dos componentes lazy principais
export const LazyAdminDashboard = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminDashboard {...props} />
  </Suspense>
)

export const LazyGestorDashboard = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <GestorDashboard {...props} />
  </Suspense>
)

export const LazyClienteDashboard = () => (
  <Suspense fallback={<LoadingFallback />}>
    <ClienteDashboard />
  </Suspense>
)

export const LazyClientesTable = () => (
  <Suspense fallback={<LoadingFallback />}>
    <ClientesTable />
  </Suspense>
)

export const LazyGestoresManagement = () => (
  <Suspense fallback={<LoadingFallback />}>
    <GestoresManagement />
  </Suspense>
)

export const LazySacDashboard = () => (
  <Suspense fallback={<LoadingFallback />}>
    <SacDashboard />
  </Suspense>
)

export const LazyAdminChatLayoutSplit = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminChatLayoutSplit />
  </Suspense>
)

export const LazyRelatorioSacGestores = () => (
  <Suspense fallback={<LoadingFallback />}>
    <SacGestorReport />
  </Suspense>
)
