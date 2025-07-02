
import { useState } from 'react'
import { TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit2, Check, X, DollarSign } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency, parseCurrencyToNumber, formatCurrencyInput } from '@/utils/currencyUtils'
import { toast } from '@/hooks/use-toast'

interface ClienteRowValorVendaProps {
  clienteId: string
  valorVenda: number | null
  isAdmin: boolean
  onSave: (clienteId: string, novoValor: number) => Promise<boolean>
  compact?: boolean
}

export function ClienteRowValorVenda({
  clienteId,
  valorVenda,
  isAdmin,
  onSave,
  compact = false
}: ClienteRowValorVendaProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState('')
  const [saving, setSaving] = useState(false)

  const handleEdit = () => {
    if (!isAdmin) {
      toast({
        title: "Permissão negada",
        description: "Apenas administradores podem editar o valor da venda",
        variant: "destructive"
      })
      return
    }
    
    setTempValue(valorVenda ? formatCurrency(valorVenda) : '')
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!tempValue.trim()) {
      toast({
        title: "Erro",
        description: "Digite um valor válido",
        variant: "destructive"
      })
      return
    }

    const numericValue = parseCurrencyToNumber(tempValue)
    
    if (numericValue <= 0) {
      toast({
        title: "Erro",
        description: "O valor deve ser maior que R$ 0,00",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    
    try {
      const success = await onSave(clienteId, numericValue)
      
      if (success) {
        setIsEditing(false)
        toast({
          title: "Sucesso",
          description: "Valor da venda atualizado com sucesso"
        })
      }
    } catch (error) {
      console.error('Erro ao salvar valor da venda:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setTempValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value)
    setTempValue(formatted)
  }

  if (compact) {
    return (
      <TableCell className="p-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center">
                {valorVenda ? (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">
                      {formatCurrency(valorVenda).replace('R$ ', '')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <DollarSign className="h-3 w-3 text-gray-400" />
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{valorVenda ? formatCurrency(valorVenda) : 'Valor não informado'}</p>
              {isAdmin && <p className="text-xs text-gray-400">Clique para editar</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    )
  }

  return (
    <TableCell className="p-2">
      {isEditing ? (
        <div className="flex items-center space-x-1">
          <Input
            type="text"
            value={tempValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-24 h-6 text-xs"
            placeholder="R$ 0,00"
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
            onClick={handleSave}
            disabled={saving}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            onClick={handleCancel}
            disabled={saving}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {valorVenda ? formatCurrency(valorVenda) : (
              <span className="text-gray-400">Não informado</span>
            )}
          </span>
          {isAdmin && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleEdit}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </TableCell>
  )
}
