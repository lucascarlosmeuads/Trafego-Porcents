
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
  const { currentManagerName } = useAuth()
  const { criarSolicitacaoSaque, loading: loadingSaque } = useSaqueOperations()
  const [saqueEnviado, setSaqueEnviado] = useState(false)

  const isEditingValue = editingComissionValue === cliente.id
  const valorComissao = cliente.valor_comissao || 0
  const isNoAr = cliente.status_campanha === 'No Ar'
  const jaFoiSolicitado = cliente.saque_solicitado || false

  // Se está editando o valor da comissão
  if (isEditingValue) {
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

  // NOVA LÓGICA: Painel do Gestor + Status "No Ar"
  if (isGestorDashboard && isNoAr && !jaFoiSolicitado && !saqueEnviado) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="default"
          size="sm"
          className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-4"
          onClick={async () => {
            const success = await criarSolicitacaoSaque(
              cliente.id,
              cliente.email_gestor || '',
              currentManagerName || '',
              valorComissao
            )
            if (success) {
              setSaqueEnviado(true)
            }
          }}
          disabled={loadingSaque}
        >
          {loadingSaque ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <span>💸</span>
          )}
          <span>Sacar Agora!</span>
          <span className="font-bold">R$ {valorComissao.toFixed(2)}</span>
        </Button>
        {/* Não mostrar botão de editar para status "No Ar" no painel do gestor */}
      </div>
    )
  }

  // Se o saque já foi solicitado ou enviado
  if (isGestorDashboard && (jaFoiSolicitado || saqueEnviado)) {
    return (
      <div className="flex items-center gap-1">
        <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded border border-green-300">
          Você enviou a solicitação de saque. Em até 1 dia útil o valor estará na conta.
        </div>
      </div>
    )
  }

  // Comportamento padrão (admin ou gestor com status diferente de "No Ar")
  return (
    <div className="flex items-center gap-1">
      <Button
        variant={cliente.comissao_paga ? "default" : "outline"}
        size="sm"
        className={`h-7 text-xs flex items-center gap-1 ${
          cliente.comissao_paga 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'border-red-600 bg-red-800 text-red-100 hover:bg-red-700'
        }`}
        onClick={() => onComissionToggle(cliente.id, cliente.comissao_paga || false)}
        disabled={updatingComission === cliente.id}
      >
        {updatingComission === cliente.id ? (
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
        ) : cliente.comissao_paga ? (
          <Check className="w-3 h-3 mr-1" />
        ) : null}
        <span>R$ {valorComissao.toFixed(2)}</span>
        {cliente.comissao_paga && <span className="ml-1">✓ Pago</span>}
        {!cliente.comissao_paga && <span className="ml-1">Pendente</span>}
      </Button>
      
      {/* Só mostra botão de editar se NÃO for painel do gestor com status "No Ar" */}
      {!(isGestorDashboard && isNoAr) && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onComissionValueEdit(cliente.id, valorComissao)}
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      )}
    </div>
  )
}
