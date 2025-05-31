
import { lazy } from 'react'

// Dashboards principais
export const AdminDashboard = lazy(() => import('./AdminDashboard'))
export const ClienteDashboard = lazy(() => import('./ClienteDashboard'))
export const GestorDashboard = lazy(() => import('./GestorDashboard'))
export const VendedorDashboard = lazy(() => import('./VendedorDashboard'))
export const SimpleVendedorDashboard = lazy(() => import('./SimpleVendedorDashboard'))
export const SitesDashboard = lazy(() => import('./SitesDashboard'))

// Componentes de tabelas
export const ClientesTable = lazy(() => import('./ClientesTable'))
export const AdminTable = lazy(() => import('./AdminTable'))
export const AdminTableOptimized = lazy(() => import('./AdminTable/AdminTableOptimized'))

// Componentes de gestão
export const GestoresManagement = lazy(() => import('./GestoresManagement'))
export const DocumentationViewer = lazy(() => import('./Documentation'))

// Chat components
export const ChatLayoutSplit = lazy(() => import('./Chat/ChatLayoutSplit'))
export const AdminChatLayoutSplit = lazy(() => import('./Chat/AdminChatLayoutSplit'))
export const ClienteChat = lazy(() => import('./Chat/ClienteChat'))

// Forms e modais
export const BriefingForm = lazy(() => import('./ClienteDashboard/BriefingForm'))
export const ArquivosUpload = lazy(() => import('./ClienteDashboard/ArquivosUpload'))
export const VendasManager = lazy(() => import('./ClienteDashboard/VendasManager'))
