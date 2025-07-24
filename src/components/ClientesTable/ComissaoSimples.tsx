
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useComissaoOperations } from '@/hooks/useComissaoOperations'
import { useComissaoAvancada } from '@/hooks/useComissaoAvancada'
import { getCommissionForDisplay } from '@/utils/dualCommissionCalculator'
import { Edit3, Check, X, Loader2 } from 'lucide-react'

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
  
  const { atualizarComissao, loading: loadingStatus, operationLock } = useComissaoOperations()
  const { atualizarValorComissao, loading: loadingValor } = useComissaoAvancada()
  
  const clienteId = cliente.id?.toString() || ''
  // Para admin/gestor, usar sistema de comissões duplas
  const valorComissao = getCommissionForDisplay(cliente, 'manager')
  const isPago = cliente.comissao === 'Pago'
  const canEdit = isAdmin
  const loading = loadingStatus || loadingValor

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

    console.log('🔄 [ComissaoSimples] Salvando novo valor da comissão:', { clienteId, valor })
    
    // Usar o hook useComissaoAvancada para atualizar o valor
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSalvarValor()
    } else if (e.key === 'Escape') {
      handleCancelarEdicao()
    }
  }

  const isDisabled = loading || operationLock || !canEdit || clickTimeout

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
                onKeyDown={handleKeyPress}
                className="h-6 w-20 text-xs"
                autoFocus
                disabled={loading}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSalvarValor}
                disabled={loading}
                className="h-6 w-6 p-0"
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3 text-green-600" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelarEdicao}
                disabled={loading}
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
            onKeyDown={handleKeyPress}
            className="h-7 text-xs w-20"
            autoFocus
            disabled={loading}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSalvarValor}
            disabled={loading}
            className="h-7 w-7 p-0"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3 text-green-600" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancelarEdicao}
            disabled={loading}
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
          </div>
        )}
      </Button>
    </div>
  )
}
