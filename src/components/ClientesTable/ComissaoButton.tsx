
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useComissaoOperations } from '@/hooks/useComissaoOperations'

interface ComissaoButtonProps {
  cliente: Cliente
  isGestorDashboard?: boolean
  isAdmin?: boolean
  onComissionUpdate?: () => void
  compact?: boolean
}

export function ComissaoButton({
  cliente,
  isGestorDashboard = false,
  isAdmin = false,
  onComissionUpdate,
  compact = false
}: ComissaoButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [clickTimeout, setClickTimeout] = useState(false)
  const { atualizarComissao, loading, operationLock } = useComissaoOperations()
  
  const clienteId = cliente.id?.toString() || ''
  const valorComissao = cliente.valor_comissao || 60
  const isPago = cliente.comissao === 'Pago'

  // Para gestores (não admins), mostrar apenas visualização
  const canEdit = isAdmin

  const handleComissionToggle = async () => {
    if (!canEdit || loading || operationLock || clickTimeout) return

    // PROTEÇÃO ANTI-CLIQUE MÚLTIPLO: Timeout de 2 segundos
    setClickTimeout(true)
    setTimeout(() => setClickTimeout(false), 2000)

    console.log('🔄 [ComissaoButton] === INICIANDO TOGGLE SEGURO ===')
    console.log('🔄 [ComissaoButton] Cliente selecionado:', {
      clienteId,
      clienteNome: cliente.nome_cliente,
      statusAtual: cliente.comissao,
      valorComissao: cliente.valor_comissao
    })

    const novoStatus = isPago ? 'Pendente' : 'Pago'
    
    console.log('🔄 [ComissaoButton] Executando atualização:', {
      clienteId,
      novoStatus,
      statusAnterior: cliente.comissao
    })

    const sucesso = await atualizarComissao(clienteId, novoStatus)
    
    if (sucesso) {
      console.log('✅ [ComissaoButton] Atualização bem-sucedida, chamando refresh')
      
      // Aguardar um momento antes de fazer refresh para garantir que o banco foi atualizado
      setTimeout(() => {
        if (onComissionUpdate) {
          console.log('🔄 [ComissaoButton] Executando refresh dos dados')
          onComissionUpdate()
        }
      }, 500)
    } else {
      console.error('❌ [ComissaoButton] Falha na atualização')
    }
  }

  // Indicador visual durante timeout
  const isDisabled = loading || operationLock || !canEdit || clickTimeout

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger>
              <Button
                size="sm"
                variant="outline"
                disabled={isDisabled}
                onClick={handleComissionToggle}
                className={`
                  h-6 px-2 py-0 text-xs font-medium min-w-fit
                  ${isPago 
                    ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                  }
                  ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}
                  ${isDisabled ? 'opacity-50 cursor-wait' : ''}
                `}
              >
                {isDisabled ? '...' : formatCurrency(valorComissao)}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p><strong>Cliente:</strong> {cliente.nome_cliente}</p>
                <p><strong>Status:</strong> {cliente.comissao || 'Pendente'}</p>
                <p><strong>Valor:</strong> {formatCurrency(valorComissao)}</p>
                {canEdit ? (
                  <p className="text-xs mt-1">
                    {isDisabled ? 'Processando...' : 
                     isPago ? 'Clique para marcar como pendente' : 'Clique para marcar como pago'}
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
        disabled={isDisabled}
        onClick={handleComissionToggle}
        className={`
          h-8 text-xs px-3
          ${isPago 
            ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
            : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
          }
          ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}
          ${isDisabled ? 'opacity-50 cursor-wait' : ''}
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
        ) : isDisabled ? (
          clickTimeout ? 'Aguarde...' : 'Processando...'
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
