import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Save, X, Edit, Hash } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ClienteRowBMProps {
  clienteId: string
  numeroBM: string
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
  editingBM,
  bmValue,
  setBmValue,
  onBMEdit,
  onBMSave,
  onBMCancel,
  compact = false
}: ClienteRowBMProps) {
  const isEditing = editingBM === clienteId

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Input
                value={bmValue}
                onChange={(e) => setBmValue(e.target.value)}
                placeholder="BM"
                className="h-6 w-16 bg-background text-white text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onBMSave(clienteId)
                  }
                  if (e.key === 'Escape') {
                    onBMCancel()
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={() => onBMSave(clienteId)}
                className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-2 w-2" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onBMCancel}
                className="h-6 w-6 p-0"
              >
                <X className="h-2 w-2" />
              </Button>
            </>
          ) : (
            <>
              {numeroBM && numeroBM.trim() !== '' ? (
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onBMEdit(clienteId, numeroBM || '')}
                      className="h-6 w-6 p-0"
                    >
                      <Hash className="h-2 w-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>BM: {numeroBM}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onBMEdit(clienteId, '')}
                      className="h-6 w-6 p-0"
                    >
                      <Hash className="h-2 w-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Adicionar BM</p>
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
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <Input
            value={bmValue}
            onChange={(e) => setBmValue(e.target.value)}
            placeholder="Número BM"
            className="h-8 w-32 bg-background text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onBMSave(clienteId)
              }
              if (e.key === 'Escape') {
                onBMCancel()
              }
            }}
          />
          <Button 
            size="sm" 
            onClick={() => onBMSave(clienteId)}
            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
          >
            <Save className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onBMCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <>
          {numeroBM && numeroBM.trim() !== '' ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-white border-white">
                {numeroBM}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBMEdit(clienteId, numeroBM || '')}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBMEdit(clienteId, '')}
              className="h-8 text-white"
            >
              <Edit className="h-3 w-3 mr-1" />
              Adicionar BM
            </Button>
          )}
        </>
      )}
    </div>
  )
}
