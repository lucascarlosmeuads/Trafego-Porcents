import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DollarSign, Lock, AlertTriangle } from 'lucide-react'
import { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useComissaoOperations } from '@/hooks/useComissaoOperations'

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
  const { toggleComissao, isAnyOperationRunning, currentOperation } = useComissaoOperations()
  
  const clienteId = cliente.id?.toString() || ''
  const isUpdating = updatingComission === clienteId || 
                    isAnyOperationRunning || 
                    currentOperation?.clienteId === clienteId
  
  const valorComissao = cliente.valor_comissao || 60
  const isPago = cliente.comissao === 'Pago'
  const canEdit = isAdmin

  // Detectar se este cliente está sendo processado especificamente
  const isThisClientBeingProcessed = currentOperation?.clienteId === clienteId

  const handleClick = async () => {
    if (!canEdit || isAnyOperationRunning) {
      console.warn('🚫 [ComissaoButton] Operação bloqueada:', {
        canEdit,
        isAnyOperationRunning,
        clienteId
      })
      return
    }

    console.log('🎯 [ComissaoButton] === INICIANDO OPERAÇÃO SEGURA ===')
    console.log('📋 Cliente:', { 
      id: clienteId, 
      nome: cliente.nome_cliente, 
      statusAtual: cliente.comissao || 'Pendente' 
    })

    const currentStatus = cliente.comissao || 'Pendente'
    
    const result = await toggleComissao(
      clienteId,
      currentStatus,
      (newStatus) => {
        console.log('✅ [ComissaoButton] Operação concluída com sucesso:', {
          clienteId,
          newStatus
        })
        // Simular o callback antigo para manter compatibilidade
        onComissionToggle(clienteId, newStatus === 'Pago')
      }
    )

    if (!result.success) {
      console.error('❌ [ComissaoButton] Operação falhou para cliente:', clienteId)
    }
  }

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
                onClick={handleClick}
                className={`
                  h-6 px-2 py-0 text-xs font-medium min-w-fit relative
                  ${isPago 
                    ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                  }
                  ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}
                  ${isAnyOperationRunning && !isThisClientBeingProcessed ? 'opacity-40' : ''}
                `}
              >
                {isThisClientBeingProcessed && (
                  <div className="absolute inset-0 bg-yellow-500/20 border border-yellow-500 rounded animate-pulse">
                    <div className="flex items-center justify-center h-full">
                      <Lock className="h-2 w-2 text-yellow-600" />
                    </div>
                  </div>
                )}
                {formatCurrency(valorComissao)}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p><strong>Status:</strong> {cliente.comissao || 'Pendente'}</p>
                <p><strong>Valor:</strong> {formatCurrency(valorComissao)}</p>
                {isAnyOperationRunning && (
                  <p className="text-xs mt-1 text-yellow-300 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Sistema protegido - aguarde operação atual
                  </p>
                )}
                {canEdit && !isAnyOperationRunning ? (
                  <p className="text-xs mt-1">
                    {isPago ? 'Clique para marcar como pendente' : 'Clique para marcar como pago'}
                  </p>
                ) : (
                  <p className="text-xs mt-1 text-orange-300">
                    {!canEdit ? 'Apenas admins podem alterar' : 'Aguarde...'}
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
        onClick={handleClick}
        className={`
          h-8 text-xs px-3 relative
          ${isPago 
            ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
            : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
          }
          ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}
          ${isAnyOperationRunning && !isThisClientBeingProcessed ? 'opacity-40' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isThisClientBeingProcessed && (
          <div className="absolute inset-0 bg-yellow-500/20 border border-yellow-500 rounded animate-pulse">
            <div className="flex items-center justify-center h-full">
              <Lock className="h-3 w-3 text-yellow-600" />
            </div>
          </div>
        )}
        {!canEdit ? (
          <div className="flex items-center gap-1">
            {formatCurrency(valorComissao)}
            <span className="text-xs opacity-75">
              ({isPago ? 'Pago' : 'Pendente'})
            </span>
          </div>
        ) : isUpdating ? (
          'Processando...'
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
