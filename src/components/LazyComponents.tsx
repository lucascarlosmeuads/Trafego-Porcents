import { lazy, Suspense } from 'react'
import { LoadingFallback } from './LoadingFallback'
import { SacDashboard } from './SAC/SacDashboard'
import { AdminChatLayoutSplit } from './AdminChatLayoutSplit'
import { DocumentationViewer } from './DocumentationViewer'
import { StatusFunnelDashboard } from './StatusFunnelDashboard'

// Lazy components
const ClientesTable = lazy(() => import('./ClientesTable').then(module => ({ default: module.ClientesTable })))
const GestoresManagement = lazy(() => import('./GestoresManagement').then(module => ({ default: module.GestoresManagement })))

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

export const LazyDocumentationViewer = () => (
  <Suspense fallback={<LoadingFallback />}>
    <DocumentationViewer />
  </Suspense>
)

export const LazyStatusFunnelDashboard = () => (
  <Suspense fallback={<LoadingFallback />}>
    <StatusFunnelDashboard />
  </Suspense>
)

// Lazy component para o relatório SAC
const SacGestorReport = lazy(() => import('@/components/SAC/SacGestorReport').then(module => ({ default: module.SacGestorReport })))

export const LazyRelatorioSacGestores = () => (
  <Suspense fallback={<LoadingFallback />}>
    <SacGestorReport />
  </Suspense>
)
