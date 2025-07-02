import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useComissaoOperations } from '@/hooks/useComissaoOperations'
import { useComissaoAvancada } from '@/hooks/useComissaoAvancada'
import { Star, StarOff, Edit3, Check, X, Loader2 } from 'lucide-react'

interface ComissaoSimplesProps {
  cliente: Cliente
  isAdmin?: boolean
  onComissionUpdate?: () => void
  compact?: boolean
}

export function ComissaoSimples({
  cliente,
  isAdmin = false,
  onComissionUpdate,
  compact = false
}: ComissaoSimplesProps) {
  const [editandoValor, setEditandoValor] = useState(false)
  const [novoValor, setNovoValor] = useState((cliente.valor_comissao || 60).toString())
  const [clickTimeout, setClickTimeout] = useState(false)
  const [ultimoPagoLocal, setUltimoPagoLocal] = useState(cliente.eh_ultimo_pago || false)
  const [isProcessingUltimoPago, setIsProcessingUltimoPago] = useState(false)
  
  const { atualizarComissao, loading, operationLock } = useComissaoOperations()
  const { atualizarValorComissao, marcarComoUltimoPago, removerMarcacaoUltimoPago, loading: loadingAvancado } = useComissaoAvancada()
  
  // CORREÇÃO 1: Sincronizar estado local quando os dados do cliente mudarem
  useEffect(() => {
    console.log('🔄 [ComissaoSimples] Sincronizando estado local com dados do cliente')
    console.log('🔄 [ComissaoSimples] Cliente eh_ultimo_pago:', cliente.eh_ultimo_pago)
    console.log('🔄 [ComissaoSimples] Estado local anterior:', ultimoPagoLocal)
    
    const novoEstado = Boolean(cliente.eh_ultimo_pago === true)
    if (novoEstado !== ultimoPagoLocal) {
      console.log('🔄 [ComissaoSimples] Atualizando estado local para:', novoEstado)
      setUltimoPagoLocal(novoEstado)
    }
  }, [cliente.eh_ultimo_pago, cliente.id]) // Dependências específicas

  const clienteId = cliente.id?.toString() || ''
  const valorComissao = cliente.valor_comissao || 60
  const isPago = cliente.comissao === 'Pago'
  const isUltimoPago = ultimoPagoLocal // Usar estado local para feedback imediato
  const canEdit = isAdmin

  // Toggle entre Pago/Pendente
  const handleToggleStatus = async () => {
    if (!canEdit || loading || operationLock || clickTimeout) return

    setClickTimeout(true)
    setTimeout(() => setClickTimeout(false), 2000)

    const novoStatus = isPago ? 'Pendente' : 'Pago'
    const sucesso = await atualizarComissao(clienteId, novoStatus)
    
    if (sucesso) {
      setTimeout(() => {
        onComissionUpdate?.()
      }, 500)
    }
  }

  // Editar valor da comissão
  const handleIniciarEdicao = () => {
    if (!canEdit) return
    setNovoValor(valorComissao.toString())
    setEditandoValor(true)
  }

  const handleSalvarValor = async () => {
    const valor = parseFloat(novoValor.replace(',', '.'))
    
    if (isNaN(valor) || valor < 10 || valor > 1000) {
      return
    }

    const sucesso = await atualizarValorComissao(clienteId, valor)
    if (sucesso) {
      setEditandoValor(false)
      onComissionUpdate?.()
    }
  }

  const handleCancelarEdicao = () => {
    setNovoValor(valorComissao.toString())
    setEditandoValor(false)
  }

  // Toggle estrela último pago com melhor tratamento de erro e sincronização
  const handleToggleUltimoPago = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canEdit || isProcessingUltimoPago) return

    console.log('🌟 [ComissaoSimples] Toggle último pago iniciado')
    console.log('🌟 [ComissaoSimples] Cliente:', cliente.nome_cliente)
    console.log('🌟 [ComissaoSimples] Estado atual:', isUltimoPago)
    console.log('🌟 [ComissaoSimples] Cliente data original:', cliente.eh_ultimo_pago)

    setIsProcessingUltimoPago(true)

    // Otimistic update - atualizar UI imediatamente
    const novoEstado = !isUltimoPago
    setUltimoPagoLocal(novoEstado)
    console.log('⚡ [ComissaoSimples] Otimistic update aplicado:', novoEstado)

    try {
      let sucesso = false
      
      if (isUltimoPago) {
        console.log('🔄 [ComissaoSimples] Removendo marcação...')
        sucesso = await removerMarcacaoUltimoPago(clienteId)
      } else {
        console.log('⭐ [ComissaoSimples] Adicionando marcação...')
        sucesso = await marcarComoUltimoPago(clienteId)
      }

      if (sucesso) {
        console.log('✅ [ComissaoSimples] Operação realizada com sucesso')
        
        // CORREÇÃO: Aguardar mais tempo e forçar recarregamento para garantir sincronização
        setTimeout(() => {
          console.log('🔄 [ComissaoSimples] Forçando atualização da lista após sucesso')
          onComissionUpdate?.()
        }, 2000) // Aumentado para 2s para garantir persistência
      } else {
        console.log('❌ [ComissaoSimples] Operação falhou, revertendo estado local')
        // Reverter otimistic update se falhou
        setUltimoPagoLocal(!novoEstado)
      }
    } catch (error) {
      console.error('💥 [ComissaoSimples] Erro no toggle:', error)
      // Reverter otimistic update em caso de erro
      setUltimoPagoLocal(!novoEstado)
    } finally {
      setIsProcessingUltimoPago(false)
    }
  }

  const isDisabled = loading || operationLock || !canEdit || clickTimeout || loadingAvancado || isProcessingUltimoPago

  // CORREÇÃO 2: Adicionar loading state visual
  if (!clienteId) {
    console.warn('⚠️ [ComissaoSimples] Cliente sem ID, não renderizando')
    return null
  }

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {/* Valor editável */}
          {editandoValor ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                step="0.01"
                min="10"
                max="1000"
                value={novoValor}
                onChange={(e) => setNovoValor(e.target.value)}
                className="h-6 w-20 text-xs"
                autoFocus
                disabled={loadingAvancado}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSalvarValor}
                disabled={loadingAvancado}
                className="h-6 w-6 p-0"
              >
                {loadingAvancado ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3 text-green-600" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelarEdicao}
                disabled={loadingAvancado}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3 text-red-600" />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={canEdit ? handleIniciarEdicao : undefined}
                  className="h-6 px-2 py-0 text-xs font-medium hover:bg-muted/50 gap-1"
                  disabled={!canEdit}
                >
                  {formatCurrency(valorComissao)}
                  {canEdit && <Edit3 className="h-3 w-3 opacity-50" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{canEdit ? 'Clique para editar o valor' : 'Apenas admins podem editar'}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Botão Status Pago/Pendente */}
          <Tooltip>
            <TooltipTrigger>
              <Button
                size="sm"
                variant="outline"
                disabled={isDisabled}
                onClick={handleToggleStatus}
                className={`
                  h-6 px-2 py-0 text-xs font-medium
                  ${isPago 
                    ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                  }
                  ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}
                  ${isDisabled ? 'opacity-50 cursor-wait' : ''}
                `}
              >
                {isDisabled ? '...' : (isPago ? 'Pago' : 'Pendente')}
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

          {/* Estrela Último Pago com melhor feedback visual e logging */}
          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggleUltimoPago}
              disabled={isProcessingUltimoPago}
              className="h-6 w-6 p-0"
              title={isUltimoPago ? "Remover marcação de último pago" : "Marcar como último pago"}
            >
              {isProcessingUltimoPago ? (
                <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
              ) : isUltimoPago ? (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              ) : (
                <StarOff className="h-3 w-3 text-gray-400 hover:text-yellow-500" />
              )}
            </Button>
          )}
        </div>
      </TooltipProvider>
    )
  }

  // Versão não compacta (para desktop)
  return (
    <div className="flex flex-col gap-2">
      {/* Valor editável */}
      {editandoValor ? (
        <div className="flex items-center gap-1 min-w-[120px]">
          <Input
            type="number"
            step="0.01"
            min="10"
            max="1000"
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
            className="h-7 text-xs w-20"
            autoFocus
            disabled={loadingAvancado}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSalvarValor}
            disabled={loadingAvancado}
            className="h-7 w-7 p-0"
          >
            {loadingAvancado ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3 text-green-600" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancelarEdicao}
            disabled={loadingAvancado}
            className="h-7 w-7 p-0"
          >
            <X className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={canEdit ? handleIniciarEdicao : undefined}
          className="h-auto p-1 font-medium hover:bg-muted/50 gap-1"
          disabled={!canEdit}
        >
          {formatCurrency(valorComissao)}
          {canEdit && <Edit3 className="h-3 w-3 opacity-50" />}
        </Button>
      )}

      {/* Botão Status */}
      <Button
        size="sm"
        variant="outline"
        disabled={isDisabled}
        onClick={handleToggleStatus}
        className={`
          h-8 text-xs px-3 relative
          ${isPago 
            ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
            : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
          }
          ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}
          ${isDisabled ? 'opacity-50 cursor-wait' : ''}
        `}
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
        ) : (
          <div className="flex items-center gap-1">
            {isPago ? 'Pago' : 'Pendente'}
            {isUltimoPago && (
              <Star className="h-3 w-3 ml-1 text-yellow-300 fill-current" />
            )}
          </div>
        )}
      </Button>

      {/* Estrela com melhor feedback */}
      {canEdit && (
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleUltimoPago}
            disabled={isProcessingUltimoPago}
            className="h-6 w-6 p-0"
            title={isUltimoPago ? "Remover marcação de último pago" : "Marcar como último pago"}
          >
            {isProcessingUltimoPago ? (
              <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
            ) : isUltimoPago ? (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            ) : (
              <StarOff className="h-3 w-3 text-gray-400 hover:text-yellow-500" />
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
