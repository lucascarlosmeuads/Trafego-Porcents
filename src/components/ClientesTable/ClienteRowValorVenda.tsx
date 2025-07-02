
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import { formatCurrency } from '@/utils/currencyUtils'
import { Edit2, Check, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ClienteRowValorVendaProps {
  clienteId: string
  valorAtual: number | null
  isAdmin: boolean
  onUpdate: (id: string, field: string, value: number) => Promise<boolean>
}

export function ClienteRowValorVenda({ 
  clienteId, 
  valorAtual, 
  isAdmin, 
  onUpdate 
}: ClienteRowValorVendaProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [valorInput, setValorInput] = useState('')
  const [valorNumerico, setValorNumerico] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const startEdit = () => {
    if (!isAdmin) return
    
    setIsEditing(true)
    const valorFormatado = valorAtual ? formatCurrency(valorAtual).replace('R$ ', '') : ''
    setValorInput(valorFormatado)
    setValorNumerico(valorAtual || 0)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setValorInput('')
    setValorNumerico(0)
  }

  const saveEdit = async () => {
    if (valorNumerico <= 0) {
      toast({
        title: "Erro",
        description: "O valor da venda deve ser maior que zero",
        variant: "destructive"
      })
      return
    }

    setIsUpdating(true)
    
    try {
      const success = await onUpdate(clienteId, 'valor_venda_inicial', valorNumerico)
      
      if (success) {
        setIsEditing(false)
        toast({
          title: "Sucesso",
          description: "Valor da venda atualizado"
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar valor:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 min-w-[200px]">
        <CurrencyInput
          value={valorInput}
          onChange={(formatted, numeric) => {
            setValorInput(formatted)
            setValorNumerico(numeric)
          }}
          className="w-32"
        />
        <Button
          size="sm"
          onClick={saveEdit}
          disabled={isUpdating}
          className="p-1 h-8 w-8"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={cancelEdit}
          disabled={isUpdating}
          className="p-1 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className={`${valorAtual ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
        {valorAtual ? formatCurrency(valorAtual) : 'Não informado'}
      </span>
      {isAdmin && (
        <Button
          size="sm"
          variant="ghost"
          onClick={startEdit}
          className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
