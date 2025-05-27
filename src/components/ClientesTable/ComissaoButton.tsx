
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
  onComissionToggle: (clienteId: string, currentStatus: boolean) => void
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

  const isEditingValue = editingComissionValue === cliente.id
  const valorComissao = cliente.valor_comissao || 0
  const isSaquePendente = cliente.status_campanha === 'Saque Pendente'
  const jaFoiSolicitado = cliente.saque_solicitado || false
  
  // Verificar se a solicitação foi paga pelo admin
  const saqueFoiPago = solicitacoesPagas.includes(cliente.id.toString())

  // Debug logs para verificar o estado
  console.log('🔍 [ComissaoButton] Cliente:', cliente.nome_cliente, {
    status: cliente.status_campanha,
    isSaquePendente,
    jaFoiSolicitado,
    saqueFoiPago,
    saqueEnviado,
    isGestorDashboard
  })

  // NOVA REGRA: Gestores não podem editar comissão em nenhuma situação
  if (isGestorDashboard && isEditingValue) {
    // Se for painel do gestor e estiver tentando editar, cancelar automaticamente
    onComissionValueCancel()
    return null
  }

  // Para admin: manter comportamento de edição normal
  if (!isGestorDashboard && isEditingValue) {
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
          onClick={() => onComissionValueSave(cliente.id, parseFloat(comissionValueInput) || 0)}
        >
          <Check className="w-3 h-3 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={onComissionValueCancel}
        >
          <X className="w-3 h-3 text-red-600" />
        </Button>
      </div>
    )
  }

  // PAINEL DO GESTOR - Saque foi pago pelo admin
  if (isGestorDashboard && saqueFoiPago) {
    console.log('✅ [ComissaoButton] Saque pago - mostrando estado final')
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

  // PAINEL DO GESTOR - Status "Saque Pendente" + Saque disponível
  if (isGestorDashboard && isSaquePendente && !jaFoiSolicitado && !saqueEnviado && !saqueFoiPago) {
    console.log('🎯 [ComissaoButton] Mostrando botão SACAR AGORA!')
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="default"
          size="sm"
          className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3"
          onClick={async () => {
            console.log('💸 [ComissaoButton] Clicou em SACAR AGORA para cliente:', cliente.nome_cliente)
            const success = await criarSolicitacaoSaque(
              cliente.id,
              cliente.email_gestor || '',
              currentManagerName || '',
              valorComissao
            )
            if (success) {
              console.log('✅ [ComissaoButton] Saque criado com sucesso!')
              setSaqueEnviado(true)
            } else {
              console.error('❌ [ComissaoButton] Falha ao criar saque')
            }
          }}
          disabled={loadingSaque}
        >
          {loadingSaque ? (
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

  // PAINEL DO GESTOR - Saque já solicitado ou enviado (mas ainda não pago)
  if (isGestorDashboard && (jaFoiSolicitado || saqueEnviado) && !saqueFoiPago) {
    console.log('⏳ [ComissaoButton] Saque já solicitado - aguardando')
    return (
      <div className="flex items-center gap-1">
        <div className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-300">
          Solicitação enviada - Aguardando processamento
        </div>
      </div>
    )
  }

  // PAINEL DO GESTOR - Qualquer outro caso (status diferente de "Saque Pendente" ou comissão paga)
  if (isGestorDashboard) {
    console.log('🔒 [ComissaoButton] Status travado para gestor')
    return (
      <div className="flex items-center gap-1">
        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded border">
          R$ {valorComissao.toFixed(2)} - Travado
        </div>
      </div>
    )
  }

  // PAINEL DO ADMIN - Comportamento completo
  return (
    <div className="flex items-center gap-1">
      <Button
        variant={cliente.comissao_paga ? "default" : "outline"}
        size="sm"
        className={`h-7 text-xs flex items-center gap-1 ${
          cliente.comissao_paga 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'border-red-600 bg-red-800 text-red-100 hover:bg-red-700'
        }`}
        onClick={() => onComissionToggle(cliente.id, cliente.comissao_paga || false)}
        disabled={updatingComission === cliente.id}
      >
        {updatingComission === cliente.id ? (
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
        ) : cliente.comissao_paga ? (
          <Check className="w-3 h-3 mr-1" />
        ) : null}
        <span>R$ {valorComissao.toFixed(2)}</span>
        {cliente.comissao_paga && <span className="ml-1">✓ Pago</span>}
        {!cliente.comissao_paga && <span className="ml-1">Pendente</span>}
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0"
        onClick={() => onComissionValueEdit(cliente.id, valorComissao)}
      >
        <Edit2 className="w-3 h-3 text-muted-foreground" />
      </Button>
    </div>
  )
}
