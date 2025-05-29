
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, X, Edit2, Loader2 } from 'lucide-react'
import { useSaqueOperations } from '@/hooks/useSaqueOperations'
import { useAuth } from '@/hooks/useAuth'
import type { Cliente } from '@/lib/supabase'

interface ComissaoButtonProps {
  cliente: Cliente
  isGestorDashboard?: boolean
  updatingComission: string | null
  editingComissionValue: string | null
  comissionValueInput: string
  setComissionValueInput: (value: string) => void
  onComissionToggle: (clienteId: string, currentStatus: boolean) => void
  onComissionValueEdit: (clienteId: string, currentValue: number) => void
  onComissionValueSave: (clienteId: string, newValue: number) => void
  onComissionValueCancel: () => void
}

export function ComissaoButton({
  cliente,
  isGestorDashboard = false,
  updatingComission,
  editingComissionValue,
  comissionValueInput,
  setComissionValueInput,
  onComissionToggle,
  onComissionValueEdit,
  onComissionValueSave,
  onComissionValueCancel
}: ComissaoButtonProps) {
  const { currentManagerName, isAdmin } = useAuth()
  const { criarSolicitacaoSaque, loading: loadingSaque } = useSaqueOperations()
  const [saqueEnviado, setSaqueEnviado] = useState(false)

  const isEditingValue = editingComissionValue === cliente.id
  const valorComissao = cliente.valor_comissao || 0
  const isCampanhaNoAr = cliente.status_campanha === 'Campanha no Ar'
  const comissaoStatus = cliente.comissao || 'Pendente'

  console.log('🔍 [ComissaoButton] Cliente:', cliente.nome_cliente, {
    status: cliente.status_campanha,
    comissaoStatus,
    isCampanhaNoAr,
    isGestorDashboard,
    valorComissao
  })

  // PAINEL DO ADMIN - Modo de edição de valor
  if (!isGestorDashboard && isEditingValue) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          <span className="text-green-400 text-xs mr-1">R$</span>
          <Input
            value={comissionValueInput}
            onChange={(e) => setComissionValueInput(e.target.value)}
            className="h-6 text-xs w-20"
            placeholder="0.00"
            type="number"
            step="0.01"
          />
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onComissionValueSave(cliente.id, parseFloat(comissionValueInput) || 0)}
        >
          <Check className="w-3 h-3 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={onComissionValueCancel}
        >
          <X className="w-3 h-3 text-red-600" />
        </Button>
      </div>
    )
  }

  // PAINEL DO GESTOR - Comissão já foi paga
  if (isGestorDashboard && comissaoStatus === 'Pago') {
    console.log('✅ [ComissaoButton] Gestor - Comissão paga')
    return (
      <div className="flex items-center gap-1">
        <div className="text-xs text-green-700 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded border border-green-200 dark:border-green-800">
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3" />
            ✅ Pago - R$ {valorComissao.toFixed(2)}
          </span>
        </div>
      </div>
    )
  }

  // PAINEL DO GESTOR - Saque já foi solicitado
  if (isGestorDashboard && comissaoStatus === 'Solicitado') {
    console.log('⏳ [ComissaoButton] Gestor - Saque já solicitado')
    return (
      <div className="flex items-center gap-1">
        <div className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-300">
          Solicitação enviada - Aguardando processamento
        </div>
      </div>
    )
  }

  // PAINEL DO GESTOR - Campanha no ar + Pode solicitar saque
  if (isGestorDashboard && isCampanhaNoAr && comissaoStatus === 'Pendente') {
    console.log('🎯 [ComissaoButton] Gestor - Campanha no ar, pode solicitar saque!')
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="default"
          size="sm"
          className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3"
          onClick={async () => {
            console.log('💸 [ComissaoButton] Gestor solicitando saque para cliente:', cliente.nome_cliente)
            const success = await criarSolicitacaoSaque(
              cliente.id,
              cliente.email_gestor || '',
              currentManagerName || '',
              valorComissao
            )
            if (success) {
              console.log('✅ [ComissaoButton] Solicitação de saque criada com sucesso!')
              setSaqueEnviado(true)
            } else {
              console.error('❌ [ComissaoButton] Falha ao criar solicitação de saque')
            }
          }}
          disabled={loadingSaque}
        >
          {loadingSaque ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <span>💸</span>
          )}
          <span>Sacar Agora!</span>
          <span className="ml-1">R$ {valorComissao.toFixed(2)}</span>
        </Button>
      </div>
    )
  }

  // PAINEL DO GESTOR - Aguardando campanha no ar
  if (isGestorDashboard) {
    console.log('🔒 [ComissaoButton] Gestor - Aguardando campanha no ar')
    return (
      <div className="flex items-center gap-1">
        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded border">
          R$ {valorComissao.toFixed(2)} - Aguardando campanha no ar
        </div>
      </div>
    )
  }

  // PAINEL DO ADMIN - Comissão não foi paga (pode pagar a qualquer momento)
  if (!isGestorDashboard && comissaoStatus !== 'Pago') {
    console.log('💰 [ComissaoButton] Admin - Pode pagar agora')
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="default"
          size="sm"
          className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3"
          onClick={() => onComissionToggle(cliente.id, false)}
          disabled={updatingComission === cliente.id}
        >
          {updatingComission === cliente.id ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <Check className="w-3 h-3 mr-1" />
          )}
          <span>Pagar agora</span>
          <span className="ml-1">R$ {valorComissao.toFixed(2)}</span>
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onComissionValueEdit(cliente.id, valorComissao)}
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>
    )
  }

  // PAINEL DO ADMIN - Comissão já foi paga
  if (!isGestorDashboard && comissaoStatus === 'Pago') {
    console.log('✅ [ComissaoButton] Admin - Comissão já foi paga')
    return (
      <div className="flex items-center gap-1">
        <div className="text-xs text-green-700 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded border border-green-200 dark:border-green-800">
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3" />
            ✅ Pago - R$ {valorComissao.toFixed(2)}
          </span>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onComissionValueEdit(cliente.id, valorComissao)}
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>
    )
  }

  // Fallback
  return (
    <div className="flex items-center gap-1">
      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded border">
        R$ {valorComissao.toFixed(2)} - Status: {comissaoStatus}
      </div>
    </div>
  )
}
