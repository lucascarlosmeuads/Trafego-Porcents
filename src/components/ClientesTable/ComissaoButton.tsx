
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, X, Edit2, Loader2 } from 'lucide-react'
import { useSaqueOperations } from '@/hooks/useSaqueOperations'
import { useAuth } from '@/hooks/useAuth'
import { useSolicitacoesPagas } from '@/hooks/useSolicitacoesPagas'
import type { Cliente } from '@/lib/supabase'

interface ComissaoButtonProps {
  cliente: Cliente
  isGestorDashboard?: boolean
  updatingComission: string | null
  editingComissionValue: string | null
  comissionValueInput: string
  setComissionValueInput: (value: string) => void
  onComissionToggle: (clienteId: string, currentStatus: boolean) => Promise<boolean>
  onComissionValueEdit: (clienteId: string, currentValue: number) => void
  onComissionValueSave: (clienteId: string, newValue: number) => void
  onComissionValueCancel: () => void
}

export function ComissaoButton({
  cliente,
  isGestorDashboard = false,
  updatingComission,
  editingComissionValue,
  comissionValueInput,
  setComissionValueInput,
  onComissionToggle,
  onComissionValueEdit,
  onComissionValueSave,
  onComissionValueCancel
}: ComissaoButtonProps) {
  const { currentManagerName, isAdmin } = useAuth()
  const { criarSolicitacaoSaque, loading: loadingSaque } = useSaqueOperations()
  const { solicitacoesPagas } = useSolicitacoesPagas()
  const [saqueEnviado, setSaqueEnviado] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const isEditingValue = editingComissionValue === cliente.id.toString()
  const valorComissao = cliente.valor_comissao || 0
  const isCampanhaNoAr = cliente.status_campanha === 'Campanha no Ar'
  
  // Verificar se a solicitação foi paga pelo admin
  const saqueFoiPago = solicitacoesPagas.includes(cliente.id.toString())
  
  // Check if comissao is "Pago" (using the comissao field)
  const isComissaoPaga = cliente.comissao === 'Pago'

  // FUNÇÃO AUXILIAR PARA LOGS DETALHADOS
  const logClienteAction = (action: string, extraData?: any) => {
    console.log(`🔍 [ComissaoButton] ${action}:`, {
      clienteId: cliente.id,
      clienteIdType: typeof cliente.id,
      clienteIdString: cliente.id.toString(),
      clienteNome: cliente.nome_cliente,
      clienteEmail: cliente.email_cliente,
      action,
      timestamp: new Date().toISOString(),
      ...extraData
    })
  }

  // FUNÇÃO PARA VALIDAR SE É O CLIENTE CORRETO
  const validateClienteConsistency = (expectedClienteId: string, actionName: string): boolean => {
    const clienteIdStr = cliente.id.toString()
    if (clienteIdStr !== expectedClienteId) {
      console.error(`❌ [ComissaoButton] INCONSISTÊNCIA DETECTADA em ${actionName}:`, {
        expectedClienteId,
        actualClienteId: clienteIdStr,
        clienteNome: cliente.nome_cliente,
        clienteEmail: cliente.email_cliente
      })
      return false
    }
    return true
  }

  // FUNÇÃO COM DEBOUNCE PARA EVITAR CLIQUES MÚLTIPLOS
  const handleComissionToggleWithDebounce = async (currentStatus: boolean) => {
    if (isProcessing) {
      logClienteAction('BLOQUEADO - Já processando', { currentStatus })
      return
    }

    setIsProcessing(true)
    logClienteAction('INICIANDO toggle comissão', { 
      currentStatus, 
      newStatus: !currentStatus,
      isComissaoPaga,
      comissaoAtual: cliente.comissao
    })

    try {
      // VALIDAÇÃO DUPLA
      if (!validateClienteConsistency(cliente.id.toString(), 'toggle comissão')) {
        return
      }

      const success = await onComissionToggle(cliente.id.toString(), currentStatus)
      
      logClienteAction('RESULTADO toggle comissão', { 
        success,
        currentStatus,
        newStatus: !currentStatus 
      })
      
      return success
    } catch (error) {
      console.error('❌ [ComissaoButton] Erro ao toggle comissão:', error)
      logClienteAction('ERRO toggle comissão', { error: error.message })
    } finally {
      // Pequeno delay para evitar cliques múltiplos
      setTimeout(() => {
        setIsProcessing(false)
      }, 1000)
    }
  }

  // FUNÇÃO PARA SAQUE COM VALIDAÇÃO
  const handleSaqueWithValidation = async () => {
    if (isProcessing) {
      logClienteAction('BLOQUEADO - Já processando saque')
      return
    }

    setIsProcessing(true)
    logClienteAction('INICIANDO saque', { 
      isCampanhaNoAr,
      comissao: cliente.comissao,
      valorComissao
    })

    try {
      // VALIDAÇÃO DUPLA
      if (!validateClienteConsistency(cliente.id.toString(), 'saque')) {
        return
      }

      // Atualizar comissão para "Solicitado"
      const success = await onComissionToggle(cliente.id.toString(), false)
      if (success) {
        logClienteAction('SUCESSO - Saque solicitado')
        setSaqueEnviado(true)
      } else {
        logClienteAction('FALHA - Erro ao solicitar saque')
      }
    } catch (error) {
      console.error('❌ [ComissaoButton] Erro ao solicitar saque:', error)
      logClienteAction('ERRO saque', { error: error.message })
    } finally {
      // Pequeno delay para evitar cliques múltiplos
      setTimeout(() => {
        setIsProcessing(false)
      }, 1000)
    }
  }

  // Debug logs para verificar o estado
  logClienteAction('RENDERIZAÇÃO', {
    status: cliente.status_campanha,
    isCampanhaNoAr,
    comissao: cliente.comissao,
    isComissaoPaga,
    saqueFoiPago,
    saqueEnviado,
    isGestorDashboard,
    isProcessing,
    updatingComission
  })

  // NOVA REGRA: Gestores não podem editar comissão em nenhuma situação
  if (isGestorDashboard && isEditingValue) {
    // Se for painel do gestor e estiver tentando editar, cancelar automaticamente
    onComissionValueCancel()
    return null
  }

  // Para admin: manter comportamento de edição normal (APENAS PARA ADMIN)
  if (!isGestorDashboard && isAdmin && isEditingValue) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          <span className="text-green-400 text-xs mr-1">R$</span>
          <Input
            value={comissionValueInput}
            onChange={(e) => setComissionValueInput(e.target.value)}
            className="h-6 text-xs w-20"
            placeholder="0.00"
            type="number"
            step="0.01"
          />
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => {
            logClienteAction('SALVANDO valor comissão', { 
              novoValor: parseFloat(comissionValueInput) || 0 
            })
            onComissionValueSave(cliente.id.toString(), parseFloat(comissionValueInput) || 0)
          }}
        >
          <Check className="w-3 h-3 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => {
            logClienteAction('CANCELANDO edição valor comissão')
            onComissionValueCancel()
          }}
        >
          <X className="w-3 h-3 text-red-600" />
        </Button>
      </div>
    )
  }

  // PAINEL DO GESTOR - Lógica específica (SEM PODER DE EDITAR OU MARCAR COMO PAGO)
  if (isGestorDashboard) {
    // Se comissão foi paga pelo admin
    if (saqueFoiPago) {
      logClienteAction('EXIBINDO - Saque pago')
      return (
        <div className="flex items-center gap-1">
          <div className="text-xs text-green-700 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded border border-green-200 dark:border-green-800">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Saque Realizado - R$ {valorComissao.toFixed(2)}
            </span>
          </div>
        </div>
      )
    }

    // Se campanha está no ar E comissão ainda é "Pendente"
    if (isCampanhaNoAr && cliente.comissao === 'Pendente') {
      logClienteAction('EXIBINDO - Botão SACAR AGORA')
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="default"
            size="sm"
            className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3"
            onClick={handleSaqueWithValidation}
            disabled={loadingSaque || updatingComission === cliente.id.toString() || isProcessing}
          >
            {(loadingSaque || updatingComission === cliente.id.toString() || isProcessing) ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <span>💸</span>
            )}
            <span>Sacar Agora!</span>
            <span className="ml-1">R$ {valorComissao.toFixed(2)}</span>
          </Button>
        </div>
      )
    }

    // Se comissão já foi solicitada (mas ainda não paga)
    if (cliente.comissao === 'Solicitado' || saqueEnviado) {
      logClienteAction('EXIBINDO - Saque solicitado, aguardando')
      return (
        <div className="flex items-center gap-1">
          <div className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-300">
            Solicitação enviada - Aguardando processamento
          </div>
        </div>
      )
    }

    // Qualquer outro caso (status diferente de "Campanha no Ar" ou comissão paga)
    logClienteAction('EXIBINDO - Status travado para gestor')
    return (
      <div className="flex items-center gap-1">
        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded border">
          R$ {valorComissao.toFixed(2)} - Travado
        </div>
      </div>
    )
  }

  // PAINEL DO ADMIN - Comportamento original mantido COM TODAS AS PERMISSÕES
  return (
    <div className="flex items-center gap-1">
      <Button
        variant={isComissaoPaga ? "default" : "outline"}
        size="sm"
        className={`h-7 text-xs flex items-center gap-1 ${
          isComissaoPaga 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'border-red-600 bg-red-800 text-red-100 hover:bg-red-700'
        }`}
        onClick={() => handleComissionToggleWithDebounce(isComissaoPaga)}
        disabled={updatingComission === cliente.id.toString() || isProcessing}
      >
        {(updatingComission === cliente.id.toString() || isProcessing) ? (
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
        ) : isComissaoPaga ? (
          <Check className="w-3 h-3 mr-1" />
        ) : null}
        <span>R$ {valorComissao.toFixed(2)}</span>
        {isComissaoPaga && <span className="ml-1">✓ Pago</span>}
        {!isComissaoPaga && <span className="ml-1">Pendente</span>}
      </Button>
      
      {/* Botão de editar valor - APENAS PARA ADMIN */}
      {isAdmin && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => {
            logClienteAction('EDITANDO valor comissão', { valorAtual: valorComissao })
            onComissionValueEdit(cliente.id.toString(), valorComissao)
          }}
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      )}
    </div>
  )
}
