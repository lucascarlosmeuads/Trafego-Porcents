
import React from 'react'
import { ClienteRow } from './ClienteRow'
import { Cliente, type StatusCampanha } from '@/lib/supabase'

interface ClienteRowMemoProps {
  cliente: Cliente
  selectedManager: string
  index: number
  isAdmin?: boolean
  showEmailGestor?: boolean
  showSitePagoCheckbox?: boolean
  updatingStatus: string | null
  editingLink: { clienteId: string, field: string } | null
  linkValue: string
  setLinkValue: (value: string) => void
  editingBM: string | null
  bmValue: string
  setBmValue: (value: string) => void
  updatingComission: string | null
  editingComissionValue: string | null
  comissionValueInput: string
  setComissionValueInput: (value: string) => void
  getStatusColor: (status: string) => string
  onStatusChange: (clienteId: string, newStatus: StatusCampanha) => void
  onSiteStatusChange: (clienteId: string, newStatus: string) => void
  onLinkEdit: (clienteId: string, field: string, currentValue: string) => void
  onLinkSave: (clienteId: string) => Promise<boolean>
  onLinkCancel: () => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => void
  onBMCancel: () => void
  onComissionToggle: (clienteId: string, currentStatus: boolean) => Promise<boolean>
  onComissionValueEdit: (clienteId: string, currentValue: number) => void
  onComissionValueSave: (clienteId: string, newValue: number) => void
  onComissionValueCancel: () => void
  onSitePagoChange?: (clienteId: string, newValue: boolean) => void
}

// Componente memoizado para evitar re-renders desnecessários
export const ClienteRowMemo = React.memo<ClienteRowMemoProps>(function ClienteRowMemo(props) {
  return <ClienteRow {...props} />
}, (prevProps, nextProps) => {
  // Custom comparison para otimizar re-renders
  return (
    prevProps.cliente.id === nextProps.cliente.id &&
    prevProps.cliente.status_campanha === nextProps.cliente.status_campanha &&
    prevProps.cliente.site_status === nextProps.cliente.site_status &&
    prevProps.cliente.comissao_paga === nextProps.cliente.comissao_paga &&
    prevProps.cliente.valor_comissao === nextProps.cliente.valor_comissao &&
    prevProps.cliente.site_pago === nextProps.cliente.site_pago &&
    prevProps.updatingStatus === nextProps.updatingStatus &&
    prevProps.updatingComission === nextProps.updatingComission &&
    prevProps.editingComissionValue === nextProps.editingComissionValue &&
    prevProps.editingBM === nextProps.editingBM &&
    JSON.stringify(prevProps.editingLink) === JSON.stringify(nextProps.editingLink)
  )
})
