
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useComissaoOperations } from '@/hooks/useComissaoOperations'
import { useComissaoAvancada } from '@/hooks/useComissaoAvancada'
import { ComissaoEditavel } from './ComissaoEditavel'
import { HistoricoPagamentosModal } from './HistoricoPagamentosModal'
import { Star, History, StarOff } from 'lucide-react'

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
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const { atualizarComissao, loading, operationLock } = useComissaoOperations()
  const { marcarComoUltimoPago, removerMarcacaoUltimoPago } = useComissaoAvancada()
  
  const clienteId = cliente.id?.toString() || ''
  const valorComissao = cliente.valor_comissao || 60
  const isPago = cliente.comissao === 'Pago'
  const isUltimoPago = cliente.eh_ultimo_pago || false

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

  const handleToggleUltimoPago = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canEdit) return

    if (isUltimoPago) {
      await removerMarcacaoUltimoPago(clienteId)
    } else {
      await marcarComoUltimoPago(clienteId)
    }
    
    onComissionUpdate?.()
  }

  const handleAbrirHistorico = (e: React.MouseEvent) => {
    e.stopPropagation()
    setHistoricoAberto(true)
  }

  const handlePagamentoRegistrado = () => {
    onComissionUpdate?.()
    setHistoricoAberto(false)
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
                  h-6 px-2 py-0 text-xs font-medium min-w-fit relative
                  ${isPago 
                    ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                  }
                  ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}
                  ${isDisabled ? 'opacity-50 cursor-wait' : ''}
                `}
              >
                {isDisabled ? '...' : formatCurrency(valorComissao)}
                {isUltimoPago && (
                  <Star className="h-3 w-3 ml-1 text-yellow-300 fill-current" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p><strong>Cliente:</strong> {cliente.nome_cliente}</p>
                <p><strong>Status:</strong> {cliente.comissao || 'Pendente'}</p>
                <p><strong>Valor:</strong> {formatCurrency(valorComissao)}</p>
                {cliente.total_pago_comissao > 0 && (
                  <p><strong>Total Pago:</strong> {formatCurrency(cliente.total_pago_comissao)}</p>
                )}
                {isUltimoPago && (
                  <p className="text-yellow-300">⭐ Último pago</p>
                )}
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

          {canEdit && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleUltimoPago}
                className="h-6 w-6 p-0"
                title={isUltimoPago ? "Remover marcação de último pago" : "Marcar como último pago"}
              >
                {isUltimoPago ? (
                  <StarOff className="h-3 w-3 text-yellow-500" />
                ) : (
                  <Star className="h-3 w-3 text-gray-400 hover:text-yellow-500" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAbrirHistorico}
                className="h-6 w-6 p-0"
                title="Ver histórico de pagamentos"
              >
                <History className="h-3 w-3 text-gray-400 hover:text-blue-500" />
              </Button>
            </>
          )}
        </div>

        <HistoricoPagamentosModal
          open={historicoAberto}
          onOpenChange={setHistoricoAberto}
          cliente={cliente}
          onPagamentoRegistrado={handlePagamentoRegistrado}
        />
      </TooltipProvider>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Valor editável da comissão */}
      {canEdit && (
        <div className="text-center">
          <ComissaoEditavel
            clienteId={clienteId}
            valorAtual={valorComissao}
            onValorAtualizado={onComissionUpdate || (() => {})}
            disabled={!canEdit}
          />
        </div>
      )}

      {/* Botão principal de status */}
      <Button
        size="sm"
        variant="outline"
        disabled={isDisabled}
        onClick={handleComissionToggle}
        className={`
          h-8 text-xs px-3 relative
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
              {isUltimoPago && (
                <Star className="h-3 w-3 ml-1 text-yellow-300 fill-current" />
              )}
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

      {/* Controles adicionais para admins */}
      {canEdit && (
        <div className="flex justify-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleUltimoPago}
            className="h-6 w-6 p-0"
            title={isUltimoPago ? "Remover marcação de último pago" : "Marcar como último pago"}
          >
            {isUltimoPago ? (
              <StarOff className="h-3 w-3 text-yellow-500" />
            ) : (
              <Star className="h-3 w-3 text-gray-400 hover:text-yellow-500" />
            )}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAbrirHistorico}
            className="h-6 w-6 p-0"
            title="Ver histórico de pagamentos"
          >
            <History className="h-3 w-3 text-gray-400 hover:text-blue-500" />
          </Button>
        </div>
      )}

      <HistoricoPagamentosModal
        open={historicoAberto}
        onOpenChange={setHistoricoAberto}
        cliente={cliente}
        onPagamentoRegistrado={handlePagamentoRegistrado}
      />
    </div>
  )
}
