
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, X, Edit2, Loader2 } from 'lucide-react'
import { useSaqueOperations } from '@/hooks/useSaqueOperations'
import { useAuth } from '@/hooks/useAuth'
import type { Cliente } from '@/hooks/useClienteData'

interface ComissaoButtonProps {
  cliente: Cliente
  onUpdateCliente: (id: string, field: string, value: string | boolean | number) => Promise<boolean>
  isAdmin?: boolean
}

export function ComissaoButton({
  cliente,
  onUpdateCliente,
  isAdmin = false
}: ComissaoButtonProps) {
  const { currentManagerName } = useAuth()
  const { criarSolicitacaoSaque, loading: loadingSaque } = useSaqueOperations()
  const [saqueEnviado, setSaqueEnviado] = useState(false)
  const [editingValue, setEditingValue] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [updating, setUpdating] = useState(false)

  const valorComissao = cliente.valor_comissao || 60
  const isNoAr = cliente.status_campanha === 'No Ar'
  const jaFoiSolicitado = cliente.saque_solicitado || false

  const handleToggleComissao = async () => {
    setUpdating(true)
    try {
      const newStatus = !cliente.comissao_paga
      await onUpdateCliente(cliente.id, 'comissao_paga', newStatus)
    } finally {
      setUpdating(false)
    }
  }

  const handleEditValue = () => {
    setEditingValue(true)
    setInputValue(valorComissao.toString())
  }

  const handleSaveValue = async () => {
    const newValue = parseFloat(inputValue) || 0
    const success = await onUpdateCliente(cliente.id, 'valor_comissao', newValue)
    if (success) {
      setEditingValue(false)
      setInputValue('')
    }
  }

  const handleCancelEdit = () => {
    setEditingValue(false)
    setInputValue('')
  }

  const handleSaqueRequest = async () => {
    const success = await criarSolicitacaoSaque(
      cliente.id,
      cliente.email_gestor || '',
      currentManagerName || '',
      valorComissao
    )
    if (success) {
      setSaqueEnviado(true)
    }
  }

  // For gestor dashboard - saque functionality
  if (!isAdmin && isNoAr && !jaFoiSolicitado && !saqueEnviado) {
    return (
      <Button
        variant="default"
        size="sm"
        className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3"
        onClick={handleSaqueRequest}
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
    )
  }

  // For gestor dashboard - saque já solicitado
  if (!isAdmin && (jaFoiSolicitado || saqueEnviado)) {
    return (
      <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded border border-green-300">
        Você enviou a solicitação de saque. Em até 1 dia útil o valor estará na conta.
      </div>
    )
  }

  // For gestor dashboard - other cases
  if (!isAdmin) {
    return (
      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded border">
        R$ {valorComissao.toFixed(2)} - Travado
      </div>
    )
  }

  // For admin - editing value
  if (editingValue) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          <span className="text-green-400 text-xs mr-1">R$</span>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
          onClick={handleSaveValue}
        >
          <Check className="w-3 h-3 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={handleCancelEdit}
        >
          <X className="w-3 h-3 text-red-600" />
        </Button>
      </div>
    )
  }

  // For admin - normal display
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
        onClick={handleToggleComissao}
        disabled={updating}
      >
        {updating ? (
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
        ) : cliente.comissao_paga ? (
          <Check className="w-3 h-3 mr-1" />
        ) : null}
        <span>R$ {valorComissao.toFixed(2)}</span>
        {cliente.comissao_paga && <span className="ml-1">✓ Pago</span>}
        {!cliente.comissao_paga && <span className="ml-1">Pendente</span>}
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0"
        onClick={handleEditValue}
      >
        <Edit2 className="w-3 h-3 text-muted-foreground" />
      </Button>
    </div>
  )
}
