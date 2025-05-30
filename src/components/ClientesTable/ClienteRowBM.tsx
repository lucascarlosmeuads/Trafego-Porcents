
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Save, X, Edit } from 'lucide-react'

interface ClienteRowBMProps {
  clienteId: string
  numeroBM: string
  editingBM: string | null
  bmValue: string
  setBmValue: (value: string) => void
  onBMEdit: (clienteId: string, currentValue: string) => void
  onBMSave: (clienteId: string) => void
  onBMCancel: () => void
}

export function ClienteRowBM({
  clienteId,
  numeroBM,
  editingBM,
  bmValue,
  setBmValue,
  onBMEdit,
  onBMSave,
  onBMCancel
}: ClienteRowBMProps) {
  const isEditing = editingBM === clienteId

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
