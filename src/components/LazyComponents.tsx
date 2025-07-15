
import { lazy, Suspense } from 'react'
import { LoadingFallback } from './LoadingFallback'
import { SacDashboard } from './SAC/SacDashboard'
import { TermosProtection } from './ClienteDashboard/TermosProtection'

// Lazy components principais
const AdminDashboard = lazy(() => import('./AdminDashboard'))
const GestorDashboard = lazy(() => import('./GestorDashboard'))
const ClienteDashboard = lazy(() => import('./ClienteDashboard'))
const ClientesTable = lazy(() => import('./ClientesTable'))
const GestoresManagement = lazy(() => import('./GestoresManagement'))

// Lazy components adicionais
const DocumentationViewer = lazy(() => import('./Documentation/DocumentationViewer'))
const StatusFunnelDashboard = lazy(() => import('./Dashboard/StatusFunnelDashboard'))

// Lazy component para o relatório SAC
const SacGestorReport = lazy(() => import('@/components/SAC/SacGestorReport'))

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
    <TermosProtection>
      <ClienteDashboard />
    </TermosProtection>
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

export const LazyRelatorioSacGestores = () => (
  <Suspense fallback={<LoadingFallback />}>
    <SacGestorReport />
  </Suspense>
)
