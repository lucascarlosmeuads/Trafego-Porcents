
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, X, Edit2, Loader2 } from 'lucide-react'
import { useSaqueOperations } from '@/hooks/useSaqueOperations'
import { useAuth } from '@/hooks/useAuth'
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
  const { atualizarComissao, loading: loadingSaque } = useSaqueOperations()

  const isEditingValue = editingComissionValue === cliente.id.toString()
  const valorComissao = cliente.valor_comissao || 0
  const isCampanhaNoAr = cliente.status_campanha === 'Campanha no Ar'
  
  // Check if comissao is "Pago" (using the comissao field)
  const isComissaoPaga = cliente.comissao === 'Pago'

  // Debug logs para verificar o estado
  console.log('🔍 [ComissaoButton] Cliente:', cliente.nome_cliente, {
    id: cliente.id,
    status: cliente.status_campanha,
    isCampanhaNoAr,
    comissao: cliente.comissao,
    isComissaoPaga,
    isGestorDashboard
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
          onClick={() => onComissionValueSave(cliente.id.toString(), parseFloat(comissionValueInput) || 0)}
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

  // PAINEL DO GESTOR - Lógica simplificada
  if (isGestorDashboard) {
    // Se comissão foi paga pelo admin
    if (isComissaoPaga) {
      console.log('✅ [ComissaoButton] Comissão paga - mostrando estado final')
      return (
        <div className="flex items-center gap-1">
          <div className="text-xs text-green-700 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded border border-green-200 dark:border-green-800">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Pago - R$ {valorComissao.toFixed(2)}
            </span>
          </div>
        </div>
      )
    }

    // Se campanha está no ar E comissão ainda é "Pendente"
    if (isCampanhaNoAr && cliente.comissao === 'Pendente') {
      console.log('🎯 [ComissaoButton] Mostrando botão SACAR AGORA!')
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="default"
            size="sm"
            className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3"
            onClick={async () => {
              console.log('💸 [ComissaoButton] Clicou em SACAR AGORA para cliente:', cliente.nome_cliente)
              
              // Atualizar comissão para "Solicitado"
              try {
                const success = await atualizarComissao(cliente.id.toString(), 'Solicitado')
                if (success) {
                  console.log('✅ [ComissaoButton] Comissão atualizada para Solicitado!')
                } else {
                  console.error('❌ [ComissaoButton] Falha ao atualizar comissão')
                }
              } catch (error) {
                console.error('❌ [ComissaoButton] Erro ao atualizar comissão:', error)
              }
            }}
            disabled={loadingSaque || updatingComission === cliente.id.toString()}
          >
            {(loadingSaque || updatingComission === cliente.id.toString()) ? (
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
    if (cliente.comissao === 'Solicitado') {
      console.log('⏳ [ComissaoButton] Saque já solicitado - aguardando')
      return (
        <div className="flex items-center gap-1">
          <div className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-300">
            Solicitação enviada - Aguardando processamento
          </div>
        </div>
      )
    }

    // Qualquer outro caso (status diferente de "Campanha no Ar" ou comissão paga)
    console.log('🔒 [ComissaoButton] Status travado para gestor')
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
        onClick={async () => {
          try {
            console.log('🎯 [ComissaoButton] Admin clicou no botão de comissão:', {
              clienteId: cliente.id,
              clienteIdString: cliente.id.toString(),
              isComissaoPaga
            })
            await onComissionToggle(cliente.id.toString(), isComissaoPaga)
          } catch (error) {
            console.error('❌ [ComissaoButton] Erro ao toggle comissão:', error)
          }
        }}
        disabled={updatingComission === cliente.id.toString()}
      >
        {updatingComission === cliente.id.toString() ? (
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
          onClick={() => onComissionValueEdit(cliente.id.toString(), valorComissao)}
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      )}
    </div>
  )
}
