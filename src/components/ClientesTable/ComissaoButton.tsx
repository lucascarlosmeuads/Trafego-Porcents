
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Save, X, Edit, DollarSign } from 'lucide-react'
import { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface ComissaoButtonProps {
  cliente: Cliente
  isGestorDashboard?: boolean
  isAdmin?: boolean
  updatingComission: string | null
  editingComissionValue: string | null
  comissionValueInput: string
  setComissionValueInput: (value: string) => void
  onComissionToggle: (clienteId: string, currentStatus: boolean) => Promise<boolean>
  onComissionValueEdit: (clienteId: string, currentValue: number) => void
  onComissionValueSave: (clienteId: string, newValue: number) => void
  onComissionValueCancel: () => void
  compact?: boolean
}

export function ComissaoButton({
  cliente,
  isGestorDashboard = false,
  isAdmin = false,
  updatingComission,
  editingComissionValue,
  comissionValueInput,
  setComissionValueInput,
  onComissionToggle,
  onComissionValueEdit,
  onComissionValueSave,
  onComissionValueCancel,
  compact = false
}: ComissaoButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const clienteId = cliente.id?.toString() || ''
  const isUpdating = updatingComission === clienteId
  const isEditingValue = editingComissionValue === clienteId
  
  const valorComissao = cliente.valor_comissao || 60
  const isPago = cliente.comissao === 'Pago'

  // Para gestores (não admins), mostrar apenas visualização
  const canEdit = isAdmin

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {isEditingValue && canEdit ? (
            <>
              <Input
                type="number"
                value={comissionValueInput}
                onChange={(e) => setComissionValueInput(e.target.value)}
                className="h-6 w-16 bg-background text-white text-xs"
                step="0.01"
                min="0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const newValue = parseFloat(comissionValueInput)
                    if (!isNaN(newValue)) {
                      onComissionValueSave(clienteId, newValue)
                    }
                  }
                  if (e.key === 'Escape') {
                    onComissionValueCancel()
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={() => {
                  const newValue = parseFloat(comissionValueInput)
                  if (!isNaN(newValue)) {
                    onComissionValueSave(clienteId, newValue)
                  }
                }}
                className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-2 w-2" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onComissionValueCancel}
                className="h-6 w-6 p-0"
              >
                <X className="h-2 w-2" />
              </Button>
            </>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdating || !canEdit}
                    onClick={() => canEdit ? onComissionToggle(clienteId, isPago) : undefined}
                    className={`
                      h-6 w-6 p-0
                      ${isPago 
                        ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
                        : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                      }
                      ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                  >
                    <DollarSign className="h-2 w-2" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p><strong>Status:</strong> {cliente.comissao || 'Pendente'}</p>
                    <p><strong>Valor:</strong> {formatCurrency(valorComissao)}</p>
                    {canEdit ? (
                      <p className="text-xs mt-1">
                        {isPago ? 'Clique para marcar como pendente' : 'Clique para marcar como pago'}
                      </p>
                    ) : (
                      <p className="text-xs mt-1 text-orange-300">
                        Apenas admins podem alterar
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
              
              {canEdit && (
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onComissionValueEdit(clienteId, valorComissao)}
                      className="h-6 w-6 p-0"
                    >
                      <DollarSign className="h-2 w-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar valor: {formatCurrency(valorComissao)}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </div>
      </TooltipProvider>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {isEditingValue && canEdit ? (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={comissionValueInput}
            onChange={(e) => setComissionValueInput(e.target.value)}
            className="h-8 w-20 bg-background text-white"
            step="0.01"
            min="0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const newValue = parseFloat(comissionValueInput)
                if (!isNaN(newValue)) {
                  onComissionValueSave(clienteId, newValue)
                }
              }
              if (e.key === 'Escape') {
                onComissionValueCancel()
              }
            }}
          />
          <Button 
            size="sm" 
            onClick={() => {
              const newValue = parseFloat(comissionValueInput)
              if (!isNaN(newValue)) {
                onComissionValueSave(clienteId, newValue)
              }
            }}
            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
          >
            <Save className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onComissionValueCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={isUpdating || !canEdit}
            onClick={() => canEdit ? onComissionToggle(clienteId, isPago) : undefined}
            className={`
              h-8 text-xs
              ${isPago 
                ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
              }
              ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {!canEdit ? (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {isPago ? 'Pago' : 'Pendente'}
              </div>
            ) : isUpdating ? (
              'Atualizando...'
            ) : isPago ? (
              isHovered ? 'Marcar Pendente' : (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Pago
                </div>
              )
            ) : (
              isHovered ? 'Marcar Pago' : (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Pendente
                </div>
              )
            )}
          </Button>
          
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onComissionValueEdit(clienteId, valorComissao)}
              className="h-6 text-xs"
            >
              {formatCurrency(valorComissao)}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
