
import { useState } from 'react'
import { TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit2, Check, X, MessageSquare } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ClienteRowBMProps {
  clienteId: string
  numeroBM: string
  nomeCliente: string
  editingBM: string | null
  bmValue: string
  setBmValue: (value: string) => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => void
  onBMCancel: () => void
  compact?: boolean
}

export function ClienteRowBM({
  clienteId,
  numeroBM,
  nomeCliente,
  editingBM,
  bmValue,
  setBmValue,
  onBMEdit,
  onBMSave,
  onBMCancel,
  compact = false
}: ClienteRowBMProps) {
  const isEditing = editingBM === clienteId

  const handleEdit = () => {
    onBMEdit(clienteId, numeroBM || '')
  }

  const handleSave = () => {
    onBMSave(clienteId)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onBMCancel()
    }
  }

  if (compact) {
    return (
      <TableCell className="p-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center">
                {numeroBM ? (
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-blue-400 font-medium">
                      {numeroBM.substring(0, 8)}...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <MessageSquare className="h-3 w-3 text-gray-400" />
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{numeroBM || 'BM não configurado'}</p>
              <p className="text-xs text-gray-400">Clique para editar</p>
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
            value={bmValue}
            onChange={(e) => setBmValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-32 h-6 text-xs"
            placeholder="Número BM"
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
            onClick={handleSave}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            onClick={onBMCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {numeroBM || (
              <span className="text-gray-400">Não configurado</span>
            )}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={handleEdit}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </TableCell>
  )
}
