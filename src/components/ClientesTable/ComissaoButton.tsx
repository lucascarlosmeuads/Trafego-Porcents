
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DollarSign } from 'lucide-react'
import { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface ComissaoButtonProps {
  cliente: Cliente
  isGestorDashboard?: boolean
  isAdmin?: boolean
  updatingComission: string | null
  onComissionToggle: (clienteId: string, currentStatus: boolean) => Promise<boolean>
  compact?: boolean
}

export function ComissaoButton({
  cliente,
  isGestorDashboard = false,
  isAdmin = false,
  updatingComission,
  onComissionToggle,
  compact = false
}: ComissaoButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const clienteId = cliente.id?.toString() || ''
  const isUpdating = updatingComission === clienteId
  
  const valorComissao = cliente.valor_comissao || 60
  const isPago = cliente.comissao === 'Pago'

  // Para gestores (não admins), mostrar apenas visualização
  const canEdit = isAdmin

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger>
              <Button
                size="sm"
                variant="outline"
                disabled={isUpdating || !canEdit}
                onClick={() => canEdit ? onComissionToggle(clienteId, isPago) : undefined}
                className={`
                  h-6 px-2 py-0 text-xs font-medium min-w-fit
                  ${isPago 
                    ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                  }
                  ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}
                `}
              >
                {formatCurrency(valorComissao)}
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
        </div>
      </TooltipProvider>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={isUpdating || !canEdit}
        onClick={() => canEdit ? onComissionToggle(clienteId, isPago) : undefined}
        className={`
          h-8 text-xs px-3
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
            {formatCurrency(valorComissao)}
            <span className="text-xs opacity-75">
              ({isPago ? 'Pago' : 'Pendente'})
            </span>
          </div>
        ) : isUpdating ? (
          'Atualizando...'
        ) : isPago ? (
          isHovered ? 'Marcar Pendente' : (
            <div className="flex items-center gap-1">
              {formatCurrency(valorComissao)}
              <span className="text-xs opacity-75">(Pago)</span>
            </div>
          )
        ) : (
          isHovered ? 'Marcar Pago' : (
            <div className="flex items-center gap-1">
              {formatCurrency(valorComissao)}
              <span className="text-xs opacity-75">(Pendente)</span>
            </div>
          )
        )}
      </Button>
    </div>
  )
}
